const STORAGE_FAVORITOS = "ifmg_cursos_favoritos";

document.addEventListener("DOMContentLoaded", () => {
    configurarFavoritos();
    configurarCatalogo();
    configurarFormularioContato();
    configurarFormularioLogin();
});

function escaparHtml(texto) {
    const div = document.createElement("div");
    div.textContent = texto;
    return div.innerHTML;
}

function normalizarTexto(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

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

/* ============================================================
   PRIMEIRA AÇÃO DO FLUXO PRINCIPAL: FAVORITAR / REMOVER CURSOS
   ============================================================ */
function configurarFavoritos() {
    const listaCursos = document.getElementById("lista-cursos");
    const containerFavoritos = document.getElementById("container-favoritos");
    const contadorMenu = document.getElementById("contador-favoritos");
    const totalSecao = document.getElementById("total-favoritos");
    const feedbackFavoritos = document.getElementById("feedback-favoritos");

    if (!listaCursos || !containerFavoritos) return;

    // Lê os cursos disponíveis diretamente dos cards no DOM
    const cursosPorId = {};
    listaCursos.querySelectorAll(".curso-card").forEach((card) => {
        const id = card.dataset.id;
        cursosPorId[id] = {
            id,
            titulo: card.dataset.titulo,
            categoriaLabel: card.dataset.categoriaLabel,
            badge: card.dataset.badge
        };
    });

    function carregarFavoritos() {
        try {
            const salvo = JSON.parse(localStorage.getItem(STORAGE_FAVORITOS));
            if (Array.isArray(salvo)) {
                return salvo.filter((id) => Boolean(cursosPorId[id]));
            }
        } catch {
            // Ignora erro caso o localStorage esteja indisponível ou corrompido
        }
        return [];
    }

    let favoritos = carregarFavoritos();

    function salvarFavoritos() {
        try {
            localStorage.setItem(STORAGE_FAVORITOS, JSON.stringify(favoritos));
        } catch {
            // Ignora falha de armazenamento em modo restrito
        }
    }

    function exibirAvisoFavorito(tipo, texto) {
        if (!feedbackFavoritos) return;
        feedbackFavoritos.className = `alert alert-${tipo} py-2`;
        feedbackFavoritos.textContent = texto;
        feedbackFavoritos.classList.remove("d-none");
    }

    function atualizarBotoesCatalogo() {
        listaCursos.querySelectorAll(".btn-favoritar").forEach((botao) => {
            const estaFavoritado = favoritos.includes(botao.dataset.id);
            botao.classList.toggle("btn-danger", estaFavoritado);
            botao.classList.toggle("btn-outline-danger", !estaFavoritado);
            botao.setAttribute("aria-pressed", String(estaFavoritado));
            botao.textContent = estaFavoritado ? "✔ Favoritado" : "❤ Favoritar";
        });
    }

    function renderizarFavoritos() {
        if (contadorMenu) contadorMenu.textContent = String(favoritos.length);
        if (totalSecao) totalSecao.textContent = String(favoritos.length);

        atualizarBotoesCatalogo();
        containerFavoritos.innerHTML = "";

        if (favoritos.length === 0) {
            const colVazio = document.createElement("div");
            colVazio.className = "col-12";
            colVazio.innerHTML = `
                <div class="p-3 bg-white border rounded text-muted text-center">
                    Nenhum curso favoritado ainda. Clique em <strong>❤ Favoritar</strong> no catálogo acima para adicionar.
                </div>
            `;
            containerFavoritos.appendChild(colVazio);
            return;
        }

        favoritos.forEach((id) => {
            const curso = cursosPorId[id];
            if (!curso) return;

            const coluna = document.createElement("div");
            coluna.className = "col-md-6 favorito-item";

            const cardItem = document.createElement("div");
            cardItem.className = "p-3 bg-white border rounded d-flex justify-content-between align-items-center gap-2";

            const info = document.createElement("div");

            const titulo = document.createElement("strong");
            titulo.textContent = curso.titulo;

            const badge = document.createElement("span");
            badge.className = `badge ${curso.badge} ms-2`;
            badge.textContent = curso.categoriaLabel;

            info.appendChild(titulo);
            info.appendChild(badge);

            const btnRemover = document.createElement("button");
            btnRemover.type = "button";
            btnRemover.className = "btn btn-sm btn-danger btn-remover-favorito";
            btnRemover.dataset.id = curso.id;
            btnRemover.textContent = "Remover";

            cardItem.appendChild(info);
            cardItem.appendChild(btnRemover);
            coluna.appendChild(cardItem);
            containerFavoritos.appendChild(coluna);
        });
    }

    function alternarFavorito(id) {
        const curso = cursosPorId[id];
        if (!curso) return;

        const indice = favoritos.indexOf(id);
        if (indice === -1) {
            favoritos.push(id);
            exibirAvisoFavorito("success", `"${curso.titulo}" foi adicionado aos seus favoritos.`);
        } else {
            favoritos.splice(indice, 1);
            exibirAvisoFavorito("warning", `"${curso.titulo}" foi removido dos seus favoritos.`);
        }

        salvarFavoritos();
        renderizarFavoritos();
    }

    // Delegação de evento para os botões "Favoritar" do catálogo
    listaCursos.addEventListener("click", (event) => {
        const botao = event.target.closest(".btn-favoritar");
        if (!botao) return;
        alternarFavorito(botao.dataset.id);
    });

    // Delegação de evento para os botões "Remover" em Meus Favoritos
    containerFavoritos.addEventListener("click", (event) => {
        const botao = event.target.closest(".btn-remover-favorito");
        if (!botao) return;
        alternarFavorito(botao.dataset.id);
    });

    renderizarFavoritos();
}

/* ============================================================
   CATÁLOGO: BUSCA, FILTRO E ATALHO PARA INSCRIÇÃO
   ============================================================ */
function configurarCatalogo() {
    const campoBusca = document.getElementById("campo-busca");
    const filtroCategoria = document.getElementById("filtro-categoria");
    const listaCursos = document.getElementById("lista-cursos");
    const msgSemCursos = document.getElementById("msg-sem-cursos");
    const campoCurso = document.getElementById("curso");

    if (!listaCursos) return;

    const cards = Array.from(listaCursos.querySelectorAll(".curso-card"));

    function filtrarCursos() {
        const termo = normalizarTexto(campoBusca ? campoBusca.value.trim() : "");
        const categoria = filtroCategoria ? filtroCategoria.value : "todos";
        let visiveis = 0;

        cards.forEach((card) => {
            const textoCard = normalizarTexto(card.textContent);
            const categoriaCard = card.dataset.categoria;

            const combinaTexto = !termo || textoCard.includes(termo);
            const combinaCategoria = categoria === "todos" || categoriaCard === categoria;
            const mostrar = combinaTexto && combinaCategoria;

            card.classList.toggle("d-none", !mostrar);
            if (mostrar) visiveis++;
        });

        if (msgSemCursos) {
            msgSemCursos.classList.toggle("d-none", visiveis > 0);
        }
    }

    if (campoBusca) campoBusca.addEventListener("input", filtrarCursos);
    if (filtroCategoria) filtroCategoria.addEventListener("change", filtrarCursos);

    // Pré-seleciona o curso no formulário ao clicar em "Inscrever" no card
    listaCursos.addEventListener("click", (event) => {
        const botaoInscrever = event.target.closest(".btn-inscrever");
        if (!botaoInscrever || !campoCurso) return;

        campoCurso.value = botaoInscrever.dataset.curso;
        campoCurso.dispatchEvent(new Event("change"));
    });
}

/* ============================================================
   VALIDAÇÕES E FORMULÁRIOS (PRÉ-INSCRIÇÃO E LOGIN)
   ============================================================ */
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

    if (/^(\d)\1{10}$/.test(apenasDigitos)) {
        return false;
    }

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

        const nomeFormatado = escaparHtml(campoNome.value.trim());
        const emailFormatado = escaparHtml(campoEmail.value.trim());
        const nomeCurso = escaparHtml(nomesCursos[campoCurso.value] || campoCurso.value);

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
        const usuarioValor = escaparHtml(campoUsuario.value.trim());

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