import type { MunicipalityUpdate } from '../../lib/municipalities-repository';

function hasUnsafeAddressCharacters(value: string): boolean {
  return Array.from(value).some((character) => {
    const code = character.charCodeAt(0);
    return code <= 32 || code === 127 || character === '\\';
  });
}

function isWebAddress(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      (url.protocol === 'https:' || url.protocol === 'http:') &&
      !url.username &&
      !url.password &&
      !hasUnsafeAddressCharacters(value)
    );
  } catch {
    return false;
  }
}

function isImageAddress(value: string): boolean {
  if (value === '') return true;
  if (/[?#]/.test(value) || hasUnsafeAddressCharacters(value)) return false;
  if (isWebAddress(value)) return true;
  if (!value.startsWith('/') || value.startsWith('//')) return false;
  try {
    const decoded = decodeURIComponent(value);
    return (
      !decoded.startsWith('//') &&
      !/[?#]/.test(decoded) &&
      !hasUnsafeAddressCharacters(decoded) &&
      !decoded.split('/').some((part) => part === '.' || part === '..')
    );
  } catch {
    return false;
  }
}

function initializeMunicipalityEditor() {
  const form = document.querySelector<HTMLFormElement>('#municipality-editor');
  const button = form?.querySelector<HTMLButtonElement>('[data-save-button]');
  const feedback = form?.querySelector<HTMLElement>('[data-save-feedback]');
  if (!form || !button || !feedback || !form.dataset['endpoint']) return;

  const endpoint = form.dataset['endpoint'];
  const base = form.dataset['base'] ?? '';
  const fields = Array.from(
    form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      'input, textarea',
    ),
  );
  const fieldsets = Array.from(
    form.querySelectorAll<HTMLFieldSetElement>('fieldset'),
  );
  const byName = new Map(fields.map((field) => [field.name, field]));
  const read = (name: string) => byName.get(name)?.value.trim() ?? '';
  const readPayload = (): MunicipalityUpdate => ({
    name: read('name'),
    cabecera: read('cabecera'),
    description: read('description'),
    alcaldia: {
      nombre: read('alcaldia.nombre'),
      cargo: read('alcaldia.cargo'),
      fotoUrl: read('alcaldia.fotoUrl'),
    },
    contacto: {
      telefono: read('contacto.telefono'),
      correo: read('contacto.correo'),
      sitioWeb: read('contacto.sitioWeb'),
      direccion: read('contacto.direccion'),
    },
    escudoUrl: read('escudoUrl'),
    proyectosDestacados: read('proyectosDestacados')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean),
  });
  let savedSnapshot = JSON.stringify(readPayload());
  let saving = false;

  const announce = (
    message: string,
    state: 'success' | 'error' | 'pending',
  ) => {
    feedback.dataset['state'] = state;
    feedback.textContent = message;
  };

  const updateDescriptionCounter = () => {
    const counter = form.querySelector<HTMLOutputElement>(
      '[data-description-counter]',
    );
    const description = byName.get('description');
    if (counter && description)
      counter.value = `${description.value.length} / 6000 caracteres`;
  };

  function validateField(field: HTMLInputElement | HTMLTextAreaElement) {
    const value = field.value.trim();
    field.setCustomValidity('');
    if (field.required && !value)
      field.setCustomValidity('Complete este campo con información oficial.');
    if (field.dataset['imageInput'] && !isImageAddress(value)) {
      field.setCustomValidity(
        'Use una URL http(s) o una ruta del sitio sin consultas ni fragmentos.',
      );
    }
    if (field.name === 'contacto.sitioWeb' && value && !isWebAddress(value)) {
      field.setCustomValidity(
        'Utilice una dirección web válida que comience con https:// o http://.',
      );
    }
    if (field.name === 'contacto.telefono' && value) {
      const digits = value.replace(/\D/g, '').length;
      if (!/^[+\d().\s-]+$/.test(value) || digits < 8 || digits > 15) {
        field.setCustomValidity(
          'Use entre 8 y 15 dígitos; puede incluir +, (), espacios, puntos o guiones.',
        );
      }
    }
    if (field.name === 'proyectosDestacados') {
      const projects = readPayload().proyectosDestacados;
      if (
        projects.length > 30 ||
        projects.some((project) => project.length > 300)
      ) {
        field.setCustomValidity(
          'Escriba hasta 30 proyectos, de 300 caracteres cada uno, separados por saltos de línea.',
        );
      }
    }
    if (field.validity.valid) field.removeAttribute('aria-invalid');
  }

  function connectImagePreview(input: HTMLInputElement | HTMLTextAreaElement) {
    const preview = form?.querySelector<HTMLElement>(
      `[data-image-preview="${input.dataset['imageInput']}"]`,
    );
    const image = preview?.querySelector<HTMLImageElement>(
      '[data-preview-image]',
    );
    const placeholder = preview?.querySelector<HTMLElement>(
      '[data-preview-placeholder]',
    );
    if (!image || !placeholder) return;
    const emptyMessage = placeholder.textContent ?? '';
    const update = () => {
      const value = input.value.trim();
      const valid = value !== '' && isImageAddress(value);
      image.hidden = !valid;
      placeholder.hidden = valid;
      placeholder.textContent =
        value && !valid
          ? 'Introduzca una dirección válida para previsualizar la imagen.'
          : emptyMessage;
      if (valid) image.src = value.startsWith('/') ? `${base}${value}` : value;
      else image.removeAttribute('src');
    };
    image.addEventListener('error', () => {
      image.hidden = true;
      placeholder.hidden = false;
      placeholder.textContent =
        'No se pudo cargar la imagen. Revise la dirección o su disponibilidad.';
    });
    image.addEventListener('load', () => {
      image.hidden = false;
      placeholder.hidden = true;
    });
    input.addEventListener('input', update);
    update();
  }

  fields.forEach((field) => {
    validateField(field);
    field.addEventListener('input', () => {
      validateField(field);
      if (field.name === 'description') updateDescriptionCounter();
      if (!saving && JSON.stringify(readPayload()) !== savedSnapshot) {
        announce('Tiene cambios sin guardar.', 'pending');
      } else if (!saving) {
        feedback.textContent = '';
      }
    });
    if (field.dataset['imageInput']) connectImagePreview(field);
  });

  form.addEventListener(
    'invalid',
    (event) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        event.target.setAttribute('aria-invalid', 'true');
      }
      announce('Revise los campos indicados antes de guardar.', 'error');
    },
    true,
  );

  window.addEventListener('beforeunload', (event) => {
    if (JSON.stringify(readPayload()) !== savedSnapshot) {
      event.preventDefault();
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (saving) return;
    fields.forEach(validateField);
    if (!form.reportValidity()) return;
    const payload = readPayload();
    saving = true;
    button.disabled = true;
    button.textContent = 'Guardando...';
    form.setAttribute('aria-busy', 'true');
    fieldsets.forEach((fieldset) => {
      fieldset.disabled = true;
    });
    announce('Guardando los cambios…', 'pending');

    void (async () => {
      let firstInvalidField: HTMLInputElement | HTMLTextAreaElement | undefined;
      try {
        const response = await fetch(endpoint, {
          method: 'PUT',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(payload),
        });
        const result: unknown = await response.json().catch(() => null);
        if (!response.ok) {
          if (
            response.status === 422 &&
            typeof result === 'object' &&
            result !== null &&
            'issues' in result &&
            Array.isArray(result.issues)
          ) {
            const invalidLabels = new Set<string>();
            const issues: unknown[] = result.issues;
            for (const issue of issues) {
              if (
                typeof issue !== 'object' ||
                issue === null ||
                !('path' in issue) ||
                !Array.isArray(issue.path) ||
                !issue.path.every(
                  (segment: unknown) => typeof segment === 'string',
                )
              )
                continue;
              const field = byName.get(issue.path.join('.'));
              if (!field) continue;
              const label =
                field.labels?.[0]?.textContent?.replace(/\s+/g, ' ').trim() ||
                field.name;
              field.setAttribute('aria-invalid', 'true');
              field.setCustomValidity(
                'Revise el formato o contenido de este campo.',
              );
              firstInvalidField ??= field;
              invalidLabels.add(label);
            }
            if (invalidLabels.size) {
              throw new Error(
                `Revise estos campos: ${[...invalidLabels].join(', ')}.`,
              );
            }
          }
          const message =
            typeof result === 'object' &&
            result !== null &&
            'error' in result &&
            typeof result.error === 'string'
              ? result.error
              : 'No se pudieron guardar los cambios. Intente nuevamente.';
          throw new Error(message);
        }
        if (
          typeof result !== 'object' ||
          result === null ||
          !('updatedAt' in result) ||
          typeof result.updatedAt !== 'string' ||
          Number.isNaN(Date.parse(result.updatedAt))
        ) {
          throw new Error(
            'No se pudo confirmar el guardado. Verifique la ficha antes de volver a guardar.',
          );
        }
        savedSnapshot = JSON.stringify(payload);
        const date = new Intl.DateTimeFormat('es-CR', {
          dateStyle: 'medium',
          timeStyle: 'short',
          timeZone: 'America/Costa_Rica',
        }).format(new Date(result.updatedAt));
        const timestamp = document.querySelector<HTMLTimeElement>(
          `[data-canton-updated="${form.dataset['municipalityId']}"]`,
        );
        if (timestamp) {
          timestamp.dateTime = result.updatedAt;
          timestamp.textContent = date;
        }
        const heading = document.getElementById('municipality-editor-title');
        if (heading) heading.textContent = payload.name;
        const selectedName = document.querySelector<HTMLElement>(
          '[data-canton-link][aria-current="true"] strong',
        );
        if (selectedName) selectedName.textContent = payload.name;
        announce(
          `Cambios guardados correctamente. Última actualización: ${date}. Ya están disponibles en el sitio público.`,
          'success',
        );
      } catch (error) {
        const message =
          error instanceof TypeError
            ? 'No se pudo conectar con el servidor. Compruebe su conexión e intente nuevamente.'
            : error instanceof Error
              ? error.message
              : 'No se pudieron guardar los cambios. Intente nuevamente.';
        announce(
          `${message} Sus cambios permanecen en el formulario.`,
          'error',
        );
      } finally {
        saving = false;
        button.disabled = false;
        button.textContent = 'Guardar cambios';
        form.removeAttribute('aria-busy');
        fieldsets.forEach((fieldset) => {
          fieldset.disabled = false;
        });
        firstInvalidField?.focus();
      }
    })();
  });
  button.disabled = false;
}

initializeMunicipalityEditor();
