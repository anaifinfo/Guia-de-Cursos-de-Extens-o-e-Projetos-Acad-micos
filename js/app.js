document.addEventListener("DOMContentLoaded", () => {
    configurarFormularioContato();
    configurarFormularioLogin();
});

function mostrarMensagem(container, tipo, htmlConteudo) {
    container.className = `alert alert-${tipo} mt-3`;
    container.innerHTML = htmlConteudo;
    container.classList.remove("d-none");
}

function limparEstadoCampo(campo) {
    campo.classList.remove("is-invalid", "is-valid");
    const feedback = campo.parentElement.querySelector(".invalid-feedback");
    if (feedback) {
        feedback.textContent = "";
    }
}

function marcarErroCampo(campo, mensagem) {
    campo.classList.remove("is-valid");
    campo.classList.add("is-invalid");

    let feedback = campo.parentElement.querySelector(".invalid-feedback");
    if (!feedback) {
        feedback = document.createElement("div");
        feedback.className = "invalid-feedback";
        campo.parentElement.appendChild(feedback);
    }
    feedback.textContent = mensagem;
}

function marcarValidoCampo(campo) {
    campo.classList.remove("is-invalid");
    campo.classList.add("is-valid");
    const feedback = campo.parentElement.querySelector(".invalid-feedback");
    if (feedback) {
        feedback.textContent = "";
    }
}

function validarEmail(valor) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim());
}

function validarCpfOuEmail(valor) {
    const limpo = valor.trim();
    if (validarEmail(limpo)) {
        return true;
    }

    const apenasDigitos = limpo.replace(/\D/g, "");
    if (apenasDigitos.length !== 11) {
        return false;
    }

    // Rejeita sequências repetidas (ex.: 00000000000, 11111111111)
    if (/^(\d)\1{10}$/.test(apenasDigitos)) {
        return false;
    }

    // Cálculo dos dois dígitos verificadores do CPF
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += Number(apenasDigitos[i]) * (10 - i);
    }
    let digito1 = (soma * 10) % 11;
    if (digito1 === 10) digito1 = 0;
    if (digito1 !== Number(apenasDigitos[9])) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += Number(apenasDigitos[i]) * (11 - i);
    }
    let digito2 = (soma * 10) % 11;
    if (digito2 === 10) digito2 = 0;
    return digito2 === Number(apenasDigitos[10]);
}

function configurarFormularioContato() {
    const form = document.getElementById("form-contato");
    const feedbackGeral = document.getElementById("msg-feedback");
    if (!form || !feedbackGeral) return;

    const campoNome = document.getElementById("nome");
    const campoEmail = document.getElementById("email");
    const campoCurso = document.getElementById("curso");

    const nomesCursos = {
        c: "Programação em C",
        prep: "Preparatório IFMG",
        gestao: "Gestão Financeira"
    };

    function validarNome() {
        const valor = campoNome.value.trim();
        if (!valor) {
            marcarErroCampo(campoNome, "Informe seu nome completo.");
            return false;
        }
        if (valor.length < 3 || !valor.includes(" ")) {
            marcarErroCampo(campoNome, "Digite nome e sobrenome (mínimo de 3 caracteres).");
            return false;
        }
        marcarValidoCampo(campoNome);
        return true;
    }

    function validarCampoEmail() {
        const valor = campoEmail.value.trim();
        if (!valor) {
            marcarErroCampo(campoEmail, "Informe seu e-mail.");
            return false;
        }
        if (!validarEmail(valor)) {
            marcarErroCampo(campoEmail, "Digite um endereço de e-mail válido (ex.: nome@dominio.com).");
            return false;
        }
        marcarValidoCampo(campoEmail);
        return true;
    }

    function validarCurso() {
        if (!campoCurso.value) {
            marcarErroCampo(campoCurso, "Selecione um curso de interesse.");
            return false;
        }
        marcarValidoCampo(campoCurso);
        return true;
    }

    // Validação em tempo real enquanto o usuário digita/altera
    campoNome.addEventListener("input", validarNome);
    campoEmail.addEventListener("input", validarCampoEmail);
    campoCurso.addEventListener("change", validarCurso);

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const nomeOk = validarNome();
        const emailOk = validarCampoEmail();
        const cursoOk = validarCurso();

        if (!nomeOk || !emailOk || !cursoOk) {
            mostrarMensagem(
                feedbackGeral,
                "danger",
                "<strong>Atenção:</strong> Revise os campos destacados antes de confirmar a inscrição."
            );
            return;
        }

        const nomeFormatado = campoNome.value.trim();
        const emailFormatado = campoEmail.value.trim();
        const nomeCurso = nomesCursos[campoCurso.value] || campoCurso.value;

        mostrarMensagem(
            feedbackGeral,
            "success",
            `<strong>Pré-inscrição registrada!</strong><br>
             Participante: <strong>${nomeFormatado}</strong><br>
             E-mail: <strong>${emailFormatado}</strong><br>
             Curso selecionado: <strong>${nomeCurso}</strong>.`
        );

        form.reset();
        limparEstadoCampo(campoNome);
        limparEstadoCampo(campoEmail);
        limparEstadoCampo(campoCurso);
    });
}

function configurarFormularioLogin() {
    const form = document.getElementById("form-login");
    if (!form) return;

    const campoPerfil = document.getElementById("perfil");
    const campoUsuario = document.getElementById("usuario");

    // Cria área de retorno logo abaixo do formulário de login
    const retornoLogin = document.createElement("div");
    retornoLogin.id = "msg-login";
    retornoLogin.className = "alert d-none mt-3";
    form.insertAdjacentElement("afterend", retornoLogin);

    function validarUsuario() {
        const valor = campoUsuario.value.trim();
        if (!valor) {
            marcarErroCampo(campoUsuario, "Informe seu e-mail ou CPF.");
            return false;
        }
        if (!validarCpfOuEmail(valor)) {
            marcarErroCampo(campoUsuario, "Digite um e-mail válido ou um CPF com 11 dígitos.");
            return false;
        }
        marcarValidoCampo(campoUsuario);
        return true;
    }

    campoUsuario.addEventListener("input", validarUsuario);
    campoPerfil.addEventListener("change", () => {
        if (campoUsuario.value.trim()) {
            validarUsuario();
        }
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!validarUsuario()) {
            mostrarMensagem(
                retornoLogin,
                "danger",
                "<strong>Acesso negado:</strong> Verifique o e-mail ou CPF informado."
            );
            return;
        }

        const perfilValor = campoPerfil.value;
        const usuarioValor = campoUsuario.value.trim();

        if (perfilValor === "palestrante") {
            mostrarMensagem(
                retornoLogin,
                "info",
                `<strong>Acesso de Palestrante / Ministrante liberado</strong> para <strong>${usuarioValor}</strong>.<br>
                 Modo habilitado: <em>Cadastro e submissão de novos cursos/projetos de extensão</em>.`
            );
        } else {
            mostrarMensagem(
                retornoLogin,
                "success",
                `<strong>Acesso de Público Externo / Aluno liberado</strong> para <strong>${usuarioValor}</strong>.<br>
                 Modo habilitado: <em>Consulta ao catálogo, favoritos e pré-inscrição em cursos</em>.`
            );
        }
    });
}