import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'El correo es obligatorio.').email('Correo inválido.'),
  password: z.string().min(1, 'La contraseña es obligatoria.'),
});

export const registroSchema = z
  .object({
    nombreCompleto: z.string().min(3, 'Ingresa tu nombre completo.').max(120),
    email: z.string().email('Correo inválido.').max(150),
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres.')
      .max(72, 'Máximo 72 caracteres.'),
    confirmar: z.string(),
  })
  .refine((d) => d.password === d.confirmar, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmar'],
  });