## ADDED Requirements

### Requirement: Verificar identidad antes de crear contraseña
El sistema SHALL pedir correo de recuperación y cédula antes de permitir crear contraseña.
El sistema SHALL verificar que el correo pertenece a una cuenta registrada.
El sistema SHALL verificar que la cuenta está asociada a la cédula indicada.
Si los datos no coinciden, el sistema SHALL mostrar un mensaje genérico: "Datos incorrectos".
Si los datos coinciden, el sistema SHALL habilitar la creación de contraseña y configuración de MFA.

#### Scenario: Verificación exitosa
- **WHEN** el usuario ingresa un correo de recuperación y una cédula que coinciden
- **THEN** el sistema responde con `{ verificado: true }` y permite continuar a creación de contraseña

#### Scenario: Correo no existe
- **WHEN** el usuario ingresa un correo no registrado
- **THEN** el sistema responde con `{ verificado: false, error: "Datos incorrectos" }`

#### Scenario: Correo y cédula no coinciden
- **WHEN** el usuario ingresa un correo que existe pero no está asociado a la cédula
- **THEN** el sistema responde con `{ verificado: false, error: "Datos incorrectos" }`

#### Scenario: Cédula no encontrada
- **WHEN** el usuario ingresa una cédula que no existe en el sistema
- **THEN** el sistema responde con `{ verificado: false, error: "Datos incorrectos" }`

### Requirement: Flujo de registro con verificación
El sistema SHALL integrar la verificación como paso previo al formulario de creación de contraseña.
El sistema SHALL mostrar los campos: correo de recuperación + cédula en una sola pantalla.
Solo después de verificado, el sistema SHALL mostrar el formulario de contraseña y MFA.

#### Scenario: Usuario completa registro completo
- **WHEN** el usuario ingresa correo y cédula válidos, crea contraseña y configura MFA
- **THEN** el sistema crea la cuenta y redirige al dashboard

#### Scenario: Usuario cancela en paso de verificación
- **WHEN** el usuario está en el paso de verificación y hace clic en "Volver"
- **THEN** el sistema regresa al inicio de sesión sin crear cuenta
