-- Schema D1 para FEMUCARIBE
CREATE TABLE IF NOT EXISTS municipalities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  cabecera TEXT NOT NULL,
  description TEXT NOT NULL,
  alcaldia_nombre TEXT NOT NULL,
  alcaldia_cargo TEXT NOT NULL,
  alcaldia_foto_url TEXT,
  contacto_telefono TEXT,
  contacto_correo TEXT,
  contacto_sitio_web TEXT,
  contacto_direccion TEXT,
  escudo_url TEXT,
  proyectos_destacados TEXT NOT NULL DEFAULT '[]',
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  file_id TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  canton TEXT NOT NULL,
  document_date TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  original_name TEXT NOT NULL,
  download_url TEXT NOT NULL,
  relative_download_path TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
