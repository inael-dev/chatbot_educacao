export function sanitizeCpf(raw: string): string {
  return raw.replace(/\D/g, "");
}

// Standard Brazilian CPF check-digit algorithm. Rejects the well-known
// "all same digit" sequences (000.000.000-00, 111.111.111-11, ...), which
// pass a naive digit-only length check but are never valid CPFs.
export function isValidCpf(cpf: string): boolean {
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  const digits = cpf.split("").map(Number);

  for (const [weightStart, checkIndex] of [
    [10, 9],
    [11, 10],
  ] as const) {
    let sum = 0;
    for (let i = 0; i < checkIndex; i += 1) {
      sum += digits[i] * (weightStart - i);
    }
    const remainder = (sum * 10) % 11;
    const expected = remainder === 10 ? 0 : remainder;
    if (expected !== digits[checkIndex]) {
      return false;
    }
  }

  return true;
}

export function formatCpf(cpf: string): string {
  if (cpf.length !== 11) {
    return cpf;
  }
  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
}
