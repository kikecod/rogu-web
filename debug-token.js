// 🔍 SCRIPT DE DEBUG - Copiar y pegar en la consola del navegador

console.log('🔍 ===== DEBUG DE AUTENTICACIÓN =====');

// 1. Verificar token en localStorage
const token = localStorage.getItem('token');
const authToken = localStorage.getItem('authToken');
const user = localStorage.getItem('user');

console.log('\n📦 LocalStorage:');
console.log('  - token:', token ? `✅ ${token.substring(0, 30)}...` : '❌ NO EXISTE');
console.log('  - authToken:', authToken ? `✅ ${authToken.substring(0, 30)}...` : '❌ NO EXISTE');
console.log('  - user:', user ? '✅ EXISTE' : '❌ NO EXISTE');

if (user) {
  try {
    const userData = JSON.parse(user);
    console.log('\n👤 Datos del usuario:');
    console.log('  - Correo:', userData.correo);
    console.log('  - Usuario:', userData.usuario);
    console.log('  - Roles:', userData.roles?.join(', ') || 'Sin roles');
    console.log('  - ID Usuario:', userData.idUsuario);
    console.log('  - ID Persona:', userData.idPersona);
  } catch (e) {
    console.error('❌ Error al parsear usuario:', e);
  }
}

// 2. Verificar token en el payload
if (token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('\n🔐 Payload del token JWT:');
    console.log('  - Correo:', payload.correo);
    console.log('  - Usuario:', payload.usuario);
    console.log('  - Roles:', payload.roles?.join(', ') || 'Sin roles');
    console.log('  - Emitido:', new Date(payload.iat * 1000).toLocaleString());
    console.log('  - Expira:', new Date(payload.exp * 1000).toLocaleString());
    
    // Verificar si el token está expirado
    const ahora = Date.now() / 1000;
    const expira = payload.exp;
    const tiempoRestante = Math.floor((expira - ahora) / 60);
    
    if (tiempoRestante > 0) {
      console.log(`  - Estado: ✅ VÁLIDO (expira en ${tiempoRestante} minutos)`);
    } else {
      console.log(`  - Estado: ❌ EXPIRADO (hace ${Math.abs(tiempoRestante)} minutos)`);
    }
  } catch (e) {
    console.error('❌ Error al decodificar token:', e);
  }
}

// 3. Probar una request al backend
console.log('\n🌐 Probando request al backend...');
fetch('http://localhost:3000/api/sede', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
  .then(res => {
    console.log(`  - Status: ${res.status} ${res.statusText}`);
    if (res.status === 200) {
      console.log('  ✅ Autenticación exitosa!');
    } else if (res.status === 401) {
      console.log('  ❌ Token inválido o expirado');
    } else if (res.status === 403) {
      console.log('  ❌ No tienes permisos (verifica tu rol)');
    }
    return res.json();
  })
  .then(data => {
    console.log('  - Respuesta:', data);
  })
  .catch(err => {
    console.error('  ❌ Error en request:', err.message);
  });

console.log('\n===== FIN DEBUG =====\n');
