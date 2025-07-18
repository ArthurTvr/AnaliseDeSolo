document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const usuario = document.getElementById('usuario').value;
  const senha = document.getElementById('senha').value;

  // Credenciais fixas (você pode adicionar mais)
  const credenciais = [
    { usuario: '1', senha: '1' },
    { usuario: 'joao', senha: 'senha123' }
  ];

  const valido = credenciais.some(cred =>
    cred.usuario === usuario && cred.senha === senha
  );

  if (valido) {
    // Armazena no localStorage e redireciona
    localStorage.setItem('logado', 'true');
    window.location.href = "indexAnalise.html"; // redirecione para o app
  } else {
    document.getElementById('erroLogin').textContent = 'Usuário ou senha inválidos.';
  }
});
