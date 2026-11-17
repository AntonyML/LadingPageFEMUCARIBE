# Audit Documentation Architecture & Agent Rules (IF-8200)

This repository and its linked Google Drive workspace (`Proyecto`) support the Information Systems Audit for the **FEMUCARIBE Landing Page** (Course IF-8200 *Auditoría Informática*, Universidad de Costa Rica).

Every agent working on this audit MUST follow these rules without exception to prevent the structural and conceptual errors introduced by previous sessions.

---

## 1. Strict Conceptual Separation (The 3 Pillars of Entrega #2)

Based on the official course specification (`Proyecto Final 2026.pdf`, pages 6–8) and Section 7 of `Proyecto_Auditoría de Sistemas 1er entrega`, there are **three distinct artifact types** that must NEVER be conflated or mixed:

1. **Applied Instruments (`01_Instrumentos_Aplicados/`)**
   - Strictly limited to the **17 official templates** designed in Section 7 of Entrega #1, completed with field data:
     - Questionnaires: `CD-01`
     - Interview Guides: `GE-01`, `GE-02`, `GE-03`
     - Checklists: `LV-01`, `LV-02`, `LV-03`, `LV-04`, `LV-05`, `LV-06`, `LV-07`
     - Document Review Templates: `PD-01`, `PD-02`
     - Observation & Traceability Matrices: `MO-01`, `MO-02`
     - Evidence & Test Registries: `FE-01`, `FP-01`
   - **Rule:** Instruments are tables/registries. Never place folders of audit procedures (`PA-##`) or raw evidence files inside an instrument folder.

2. **Working Papers (`02_Papeles_de_Trabajo/`)**
   - Coded strictly as **`PT-PA##`** (two digits corresponding to the audit procedure `PA-01` through `PA-18`, i.e., `PT-PA01`, `PT-PA02`, ..., `PT-PA18`).
   - **One Working Paper per Procedure:** Each procedure `PA-##` has **one** working paper (`PT-PA##.docx`) that documents how the procedure was executed, which instrument was applied, the analysis performed, the conclusion reached, and cross-references to the evidence codes (`EV-###`).
   - **Prohibited Vice:** NEVER create sub-numbered working papers (`PT-PA01-01`, `PT-PA01-02`, `PT-PA02-05`, etc.) to disguise evidence files as working papers.

3. **Evidences (`03_Evidencias/`)**
   - Coded strictly as **`EV-###`** (`EV-001`, `EV-002`, `EV-003`, ...), matching their exact row in `FE-01`.
   - **Atomic Single-Source Rule (Mandatory):** It is strictly prohibited to group two or more sources, actors, or technical platforms in a single evidence file. Each distinct source or record must be documented in its own independent `EV-###` file and then referenced by code in `FE-01` and in the procedure's working paper (`PT-PA##`).
     - *Example:* Git repository evidence and Penpot prototype evidence are two distinct technical sources and must be stored in separate `EV-###` files, never combined into one document.
     - *Example:* Institutional authorization from the Executive Directorate and technical authorization from the Lead Developer are two distinct sources and must be stored in separate `EV-###` files.

---

## 2. Mandatory Google Drive Folder Hierarchy (Option A)

All audit deliverables in the Google Drive `Proyecto` folder (`1cwsqpntsu34iPTPDc5X6FkEMiLYmaZp-`) must follow this exact top-level hierarchy:

```text
Proyecto/
├── 00_Planificacion_Entrega_1_Referencia/
│   ├── Matriz_de_Riesgos_FEMUCARIBE.xlsx
│   ├── Matriz_de_Riesgos_FEMUCARIBE_simple.xlsx
│   ├── Proyecto Final 2026.pdf
│   └── Proyecto_Auditoría de Sistemas 1er entrega
├── 01_Instrumentos_Aplicados/
│   └── FE-01. Registro de evidencias (and the remaining Section 7 instruments as each PA-## is completed)
├── 02_Papeles_de_Trabajo/
│   └── PT-PA01.docx (one PT-PA##.docx per audit procedure PA-01 .. PA-18)
└── 03_Evidencias/
    ├── EV-001_<Descriptive_Name>.docx/.pdf
    ├── EV-002_<Descriptive_Name>.docx/.pdf
    └── ...
```

---

## 3. Anti-Vices Checklist (Verify Before Creating Any File)

1. **Check the "Evidencia esperada" cell in Section 6.b of Entrega #1 first:**
   - Only create the exact evidences required by that procedure's row in the Audit Program. Do not invent extra intermediate review sheets or unrequested documents.
2. **Understand parenthetical instrument references like `(FE-01)`:**
   - When the "Evidencia esperada" column ends with `(FE-01)`, it means the evidences listed before the parenthesis are registered in the `FE-01` table — it does NOT mean `FE-01` is the only file, nor does it mean `PA-01` belongs inside a folder named `FE-01`.
3. **Never rename raw institutional or technical documents as `PT-PA##`:**
   - Institutional letters (`Oficio DC-RVM-084-08-2026`), signed logs (`Bitácoras`), or technical manuals (`DT-01` to `DT-05`) are **Evidences (`EV-###`)**, never Working Papers (`PT-PA##`).
4. **Never group two sources into one `EV-###` file:**
   - Verify that every `EV-###` file has a single source (`Fuente` column in `FE-01`). If two sources are involved (e.g., Git + Penpot, or Dirección Ejecutiva + Desarrollador), split them into consecutive `EV-###` files.
5. **Verify repository facts against the real Git history:**
   - Audited branch: `main` (`132` commits on `main`; `134` total commits across `--all`).
   - Functional code freeze commit: `a1c83b247d9c5a3d354cc2cbf913c291dd7bdd4f` (`2026-11-06`).
   - Documentary consolidation commit (`HEAD`): `987d4f0b06d6e8ba405f94f17037a48177fe3294` (`2026-11-09`).
   - Never cite non-existent paths (such as `docs/agents/COORDINATION.md`).
