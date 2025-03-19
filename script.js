// Função principal para capturar e processar as parcelas
function capturarParcelas() {
    // Pega o valor do textarea
    const inputValores = document.getElementById("parcelasInput").value;

    // Extrai os valores que começam com "R$" usando uma expressão regular
    const valores = inputValores.match(/R\$\s*\d{1,6}(?:\.\d{3})*(?:,\d{2})?/g);

    // Verifica se há valores extraídos
    if (!valores) {
        alert("Nenhum valor válido encontrado. Verifique o formato dos dados.");
        return;
    }

    // Converte os valores para números
    const parcelas = valores.map(valor => {
        // Remove "R$" e espaços, depois remove pontos e substitui vírgula por ponto
        return parseFloat(valor.replace(/R\$|\s/g, '').replace(/\./g, '').replace(',', '.'));
    });

    // Pega o mês de nascimento selecionado
    const mesNascimento = parseInt(document.getElementById("mesNascimento").value);

    // Verifica se o mês é válido
    if (isNaN(mesNascimento) || mesNascimento < 1 || mesNascimento > 12) {
        alert("Por favor, selecione um mês de nascimento válido.");
        return;
    }

    

    const tabela = document.getElementById("tabela").value

    // Muda a taxa mensal por tabela
    switch (tabela) {
        case "PARANÁ":
            taxaJurosInput = 1.79;
            break;
    
        default:
            taxaJurosInput = 1.8;

    }   

    const taxaJurosMensal = parseFloat(taxaJurosInput) / 100; // Converte para decimal
    console.log(tabela)
    console.log(taxaJurosMensal)


    // Calcula a taxa anual (a.a.)
    const taxaAnual = calcularTaxaAnual(taxaJurosMensal);

    // Calcula a taxa ao dia (a.d.)
    const taxaDia = calcularTaxaDia(taxaAnual);

    // Calcula as datas de vencimento com base no mês de aniversário (uma vez por ano)
    const datasVencimento = calcularDatasVencimento(mesNascimento, parcelas.length);

    // Calcula o deságio para cada parcela
    const desagios = calcularDesagios(datasVencimento, taxaDia);

    // Calcula o valor descontado de cada parcela
    const valoresDescontados = parcelas.map((parcela, index) => parcela / desagios[index]);

    // Exibe os valores na lista com as datas de vencimento e deságios
    exibirParcelas(parcelas, datasVencimento, desagios, valoresDescontados, taxaAnual, taxaDia);
}

// Função para calcular a taxa anual (a.a.)
function calcularTaxaAnual(taxaMensal) {
    // Fórmula: (1 + i)^12 - 1
    return Math.pow(1 + taxaMensal, 12) - 1;
}

// Função para calcular a taxa ao dia (a.d.)
function calcularTaxaDia(taxaAnual) {
    // Fórmula: (1 + taxaAnual)^(1/360) - 1
    return Math.pow(1 + taxaAnual, 1 / 360) - 1;
}

// Função para calcular as datas de vencimento
function calcularDatasVencimento(mesNascimento, totalParcelas) {
    const datasVencimento = [];
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth() + 1; // getMonth() retorna 0-11

    // Encontra o próximo mês de aniversário
    let anoAniversario = anoAtual;

    if (mesNascimento < mesAtual+1) {
        // Se o mês de aniversário já passou este ano, o próximo será no próximo ano
        anoAniversario++;
    }

    // Calcula as datas de vencimento para cada parcela (uma vez por ano, no mês de aniversário)
    for (let i = 0; i < totalParcelas; i++) {
        const dataVencimento = new Date(anoAniversario + i, mesNascimento - 1, 1); // Primeiro dia do mês de aniversário
        datasVencimento.push(dataVencimento);
    }

    return datasVencimento;
}

// Função para calcular os deságios
function calcularDesagios(datasVencimento, taxaDia) {
    const hoje = new Date();
    const desagios = [];

    datasVencimento.forEach(dataVencimento => {
        // Calcula a diferença em dias entre a data atual e a data de vencimento, incluindo o dia atual
        const diferencaDias = Math.ceil((dataVencimento - hoje) / (1000 * 60 * 60 * 24));

        // Calcula o deságio: (1 + taxaDia)^diferencaDias
        const desagio = Math.pow(1 + taxaDia, diferencaDias);
        desagios.push(desagio);
    });

    return desagios;
}

// Função para exibir as parcelas na lista
function exibirParcelas(parcelas, datasVencimento, desagios, valoresDescontados, taxaAnual, taxaDia) {
    const listaParcelas = document.getElementById("listaParcelas");
    listaParcelas.innerHTML = ""; // Limpa a lista antes de adicionar novos itens

    // Adiciona cada parcela à lista com a data de vencimento e deságio
    parcelas.forEach((parcela, index) => {
        const itemLista = document.createElement("li");

        // Texto da parcela
        const textoParcela = document.createElement("span");
        textoParcela.textContent = `Parcela ${index + 1}: R$ ${parcela.toFixed(2)} - Vencimento: ${formatarData(datasVencimento[index])}`;

        // Interruptor (toggle switch)
        const switchContainer = document.createElement("label");
        switchContainer.classList.add("switch");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = true; // Por padrão, todas as parcelas são usáveis
        checkbox.dataset.index = index; // Adiciona um índice para identificar a parcela

        // Adiciona um evento para ativar as parcelas acima
        checkbox.addEventListener("change", () => {
            if (checkbox.checked) {
                // Ativa todas as parcelas acima
                for (let i = 0; i <= index; i++) {
                    const checkboxes = document.querySelectorAll(`input[type="checkbox"]`);
                    checkboxes[i].checked = true;
                }
            } else {
                // Desativa todas as parcelas abaixo
                for (let i = index; i < parcelas.length; i++) {
                    const checkboxes = document.querySelectorAll(`input[type="checkbox"]`);
                    checkboxes[i].checked = false;
                }
            }
            // Recalcula os totais com base nas parcelas selecionadas
            recalcularTotais(parcelas, datasVencimento, desagios, valoresDescontados, taxaAnual, taxaDia);
        });

        const slider = document.createElement("span");
        slider.classList.add("slider");

        switchContainer.appendChild(checkbox);
        switchContainer.appendChild(slider);

        // Adiciona texto e interruptor ao item da lista
        itemLista.appendChild(textoParcela);
        itemLista.appendChild(switchContainer);

        // Adiciona o item à lista
        listaParcelas.appendChild(itemLista);
    });

    // Exibe os resultados na coluna do meio
    recalcularTotais(parcelas, datasVencimento, desagios, valoresDescontados, taxaAnual, taxaDia);
}

// Função para recalcular os totais com base nas parcelas selecionadas
function recalcularTotais(parcelas, datasVencimento, desagios, valoresDescontados, taxaAnual, taxaDia) {
    const checkboxes = document.querySelectorAll(`input[type="checkbox"]`);

    // Filtra as parcelas selecionadas
    const parcelasSelecionadas = parcelas.filter((_, index) => checkboxes[index].checked);
    const valoresDescontadosSelecionados = valoresDescontados.filter((_, index) => checkboxes[index].checked);
    const datasVencimentoSelecionadas = datasVencimento.filter((_, index) => checkboxes[index].checked);

    // Soma todos os valores descontados das parcelas selecionadas
    const totalValoresDescontados = valoresDescontadosSelecionados.reduce((total, valor) => total + valor, 0);

    // Calcula o IOF para cada parcela selecionada
    const iofPorParcela = parcelasSelecionadas.map((parcela, index) => {
        const dias = Math.ceil((datasVencimentoSelecionadas[index] - new Date()) / (1000 * 60 * 60 * 24));
        const iofDiario = Math.min(0.000082 * dias, 0.03); // IOF diário limitado a 3%
        const iofTotal = (0.0038 + iofDiario) * valoresDescontadosSelecionados[index]; // IOF fixo + IOF diário
        return iofTotal;
    });

    // Soma o IOF de todas as parcelas selecionadas
    const iofTotal = iofPorParcela.reduce((total, iof) => total + iof, 0);

    // Calcula o valor líquido final (total dos valores descontados - IOF total)
    const valorLiquidoFinal = totalValoresDescontados - iofTotal;

    const tabela = document.getElementById("tabela").value

    switch (tabela) {
        case "SENNA":
            tac = valorLiquidoFinal*0.772 //Calcula tac SENNA
	    valorMeta = tac*1.10
            break;
    
        case "PRIME":
            tac = valorLiquidoFinal-70
	    valorMeta = tac*0.68
            break;
        case "MONACO":
            tac = valorLiquidoFinal*0.815
	    valorMeta = tac*0.90
            break;
        case "GOLD POWER":
            tac = valorLiquidoFinal*0.80
	    valorMeta = tac*0.80
            break;
        case "LIGHT":
            tac = valorLiquidoFinal
	    valorMeta = tac*0.39
            break;
        case "PARANÁ":
            tac = valorLiquidoFinal
	    valorMeta = tac*0.6956
            break;     
    }
	const valorAtualParcelas = parcelasSelecionadas.reduce((total, parcela) => total + parcela, 0);	
	const valorTotalParcelas = parcelas.reduce((total, parcela) => total + parcela, 0);

    // Exibe os resultados na coluna do meio
    const colMiddle = document.querySelector(".col-middle");
    colMiddle.innerHTML = `
        <h2>Resultados:</h2>
        <div class="resultado">
            <p><br>Valor meta: R$ ${valorMeta.toFixed(2)}</p>
        </div>
        <div class="resultado">
            <p>IOF total: R$ ${iofTotal.toFixed(2)}</p>
        </div>
	<div class="total">
            <p>Total antecipado: R$ ${valorAtualParcelas.toFixed(2)}</p>
        </div>
        <div class="resultado">
            <p><big>Valor Liberado: <strong>R$ ${tac.toFixed(2)}</strong></big></p>
        </div>
    `;
}

// Função para salvar uma consulta no histórico
function salvarConsulta(parcelas, datasVencimento, desagios, valoresDescontados, taxaAnual, taxaDia) {
    const consulta = {
        parcelas: parcelas,
        datasVencimento: datasVencimento.map(d => d.toISOString()), // Converte datas para strings
        desagios: desagios,
        valoresDescontados: valoresDescontados,
        taxaAnual: taxaAnual,
        taxaDia: taxaDia,
        dataConsulta: new Date().toLocaleString() // Data e hora da consulta
    };

    // Recupera o histórico atual do localStorage
    let historico = JSON.parse(localStorage.getItem("historicoConsultas")) || [];

    // Adiciona a nova consulta ao histórico
    historico.push(consulta);

    // Salva o histórico atualizado no localStorage
    localStorage.setItem("historicoConsultas", JSON.stringify(historico));

    // Atualiza a exibição do histórico
    exibirHistorico();
}

// Função para exibir o histórico de consultas
function exibirHistorico() {
    const historicoConsultas = document.getElementById("historicoConsultas");
    historicoConsultas.innerHTML = ""; // Limpa o histórico atual

    // Recupera o histórico do localStorage
    const historico = JSON.parse(localStorage.getItem("historicoConsultas")) || [];

    // Exibe cada consulta no histórico
    historico.forEach((consulta, index) => {
        const itemLista = document.createElement("li");

        // Texto da consulta
        const textoConsulta = document.createElement("span");
        textoConsulta.textContent = `Consulta ${index + 1} - ${consulta.dataConsulta}`;

        // Botão para ver detalhes da consulta
        const botaoDetalhes = document.createElement("button");
        botaoDetalhes.textContent = "Ver Detalhes";
        botaoDetalhes.classList.add("btn-detalhes");
        botaoDetalhes.addEventListener("click", () => exibirDetalhesConsulta(consulta));

        // Adiciona texto e botão ao item da lista
        itemLista.appendChild(textoConsulta);
        itemLista.appendChild(botaoDetalhes);

        // Adiciona o item à lista
        historicoConsultas.appendChild(itemLista);
    });
}

// Função para exibir detalhes de uma consulta
function exibirDetalhesConsulta(consulta) {
    // Calcula o valor total das parcelas
    const valorTotalParcelas = consulta.parcelas.reduce((total, parcela) => total + parcela, 0);

    // Calcula o valor líquido total
    const tac = consulta.valoresDescontados.reduce((total, valor) => total + valor, 0);

    // Exibe os detalhes em um alerta
    const detalhes = `
        Detalhes da Consulta:
        - Valor Total das Parcelas: R$ ${valorTotalParcelas.toFixed(2)}
        - Valor Líquido Total: R$ ${tac.toFixed(2)}
        - Taxa de Juros Anual (a.a.): ${(consulta.taxaAnual * 100).toFixed(2)}%
    `;
    alert(detalhes);
}

// Função para formatar datas no formato DD/MM/AAAA
function formatarData(data) {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0'); // getMonth() retorna 0-11
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

// Função para salvar a consulta atual
function salvarConsultaAtual() {
    const parcelas = document.querySelectorAll("#listaParcelas li").length > 0;
    if (!parcelas) {
        alert("Nenhuma consulta para salvar. Calcule as parcelas primeiro.");
        return;
    }

    // Captura os dados atuais
    const inputValores = document.getElementById("parcelasInput").value;
    const valores = inputValores.match(/R\$\s*\d{1,3}(?:\.\d{3})*(?:,\d{2})?/g);
    const parcelasAtuais = valores.map(valor => parseFloat(valor.replace(/R\$|\s/g, '').replace(/\./g, '').replace(',', '.')));

    const mesNascimento = parseInt(document.getElementById("mesNascimento").value);
    const tabela = parseFloat(document.getElementById("tabela").value) / 100;
    const taxaDia = calcularTaxaDia(taxaAnual);
    const datasVencimento = calcularDatasVencimento(mesNascimento, parcelasAtuais.length);
    const desagios = calcularDesagios(datasVencimento, taxaDia);
    const valoresDescontados = parcelasAtuais.map((parcela, index) => parcela / desagios[index]);

    // Salva a consulta no histórico
    salvarConsulta(parcelasAtuais, datasVencimento, desagios, valoresDescontados, taxaAnual, taxaDia);
}

// Função para limpar o histórico
function limparHistorico() {
    if (confirm("Tem certeza que deseja limpar o histórico de consultas?")) {
        localStorage.removeItem("historicoConsultas");
        exibirHistorico(); // Atualiza a exibição do histórico
    }
}

// Exibe o histórico ao carregar a página
document.addEventListener("DOMContentLoaded", exibirHistorico);
