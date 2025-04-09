type FieldResult = { [key: string]: string };
type TableRow = { [key: string]: string };

export function extractFields(text: string, fields: string[]): FieldResult {
  const result: FieldResult = {};

  fields.forEach((field) => {
    const pattern = new RegExp(`${field}\\s*:?\\s*([^\n]+)`, "i");
    const match = text.match(pattern);
    result[field] = match ? match[1].trim() : "";
  });

  return result;
}

export function extractTable(text: string, columns: string[]): TableRow[] {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const headerIndex = lines.findIndex((line) =>
    columns.every((col) => line.toLowerCase().includes(col.toLowerCase()))
  );

  if (headerIndex === -1) return [];

  const dataLines = lines.slice(headerIndex + 1);

  const rows: TableRow[] = [];

  for (const line of dataLines) {
    const parts = line.split(/\s+/);
    if (parts.length < columns.length) continue;

    const row: TableRow = {};
    for (let i = 0; i < columns.length; i++) {
      row[columns[i]] = parts[i] ?? "";
    }

    rows.push(row);
  }

  return rows;
}
