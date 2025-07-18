let chart; // para manter referência do gráfico Chart.js

document.getElementById("formSolo").addEventListener("submit", function (e) {
  e.preventDefault();

  const nomeProdutor = document.getElementById("produtor").value;

  const valores = {
    pH: parseFloat(document.getElementById("ph").value),
    Fósforo: parseFloat(document.getElementById("fosforo").value),
    Potássio: parseFloat(document.getElementById("potassio").value),
    Cálcio: parseFloat(document.getElementById("calcio").value),
    Magnésio: parseFloat(document.getElementById("magnesio").value),
  };

  const ideais = {
    pH: { min: 5.5, max: 6.5 },
    Fósforo: { min: 10, max: 20 },
    Potássio: { min: 0.3, max: 0.6 },
    Cálcio: { min: 3, max: 6 },
    Magnésio: { min: 1, max: 2 },
  };

  const resultado = document.getElementById("resultado");
  resultado.innerHTML = `<h2>Resultado da Análise:</h2><p><strong>Produtor:</strong> ${nomeProdutor}</p>`;

  const atual = [];
  const minimos = [];
  const maximos = [];

  for (const nutriente in valores) {
    const valor = valores[nutriente];
    const ideal = ideais[nutriente];
    let status, classe;

    if (valor < ideal.min) {
      status = "Baixo";
      classe = "baixo";
    } else if (valor > ideal.max) {
      status = "Alto";
      classe = "alto";
    } else {
      status = "Adequado";
      classe = "bom";
    }

    resultado.innerHTML += `<div class="resultado-item ${classe}">
      <strong>${nutriente}</strong>: ${valor} - ${status}
    </div>`;

    atual.push(valor);
    minimos.push(ideal.min);
    maximos.push(ideal.max);
  }

  gerarGrafico(Object.keys(valores), atual, minimos, maximos);
  gerarRecomendacaoAdubo(valores);
  document.getElementById("btnPdf").style.display = "block";
});

// Gera o gráfico de comparação com Chart.js
function gerarGrafico(labels, atual, min, max) {
  const ctx = document.getElementById('graficoNutrientes').getContext('2d');

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Valor Atual',
          data: atual,
          backgroundColor: '#007bff'
        },
        {
          label: 'Mínimo Ideal',
          data: min,
          backgroundColor: '#ffc107'
        },
        {
          label: 'Máximo Ideal',
          data: max,
          backgroundColor: '#28a745'
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Comparação dos Nutrientes'
        }
      }
    }
  });
}

// Gera a recomendação de adubo simples com base em fósforo e potássio
function gerarRecomendacaoAdubo(valores) {
  let recomendacao = '';
  const fosforo = valores.Fósforo;
  const potassio = valores.Potássio;

  if (fosforo < 8 && potassio < 0.3) {
    recomendacao = "Recomendado: Adubo 20-20-20 (alta dose)";
  } else if (fosforo < 10) {
    recomendacao = "Recomendado: Adubo 20-10-10 (foco em fósforo)";
  } else if (potassio < 0.3) {
    recomendacao = "Recomendado: Adubo 10-20-20 (foco em potássio)";
  } else {
    recomendacao = "Recomendado: Adubo de manutenção, como 04-14-08.";
  }

  document.getElementById("recomendacaoAdubo").innerHTML = `
    <h2>Recomendação de Adubação</h2>
    <p>${recomendacao}</p>
  `;
}

// Geração do PDF com gráfico incluso
document.getElementById("btnPdf").addEventListener("click", function () {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const nomeProdutor = document.getElementById("produtor").value;

  doc.setFontSize(16);
  doc.text("Resultado da Análise de Solo", 10, 15);

  doc.setFontSize(12);
  doc.text(`Produtor: ${nomeProdutor}`, 10, 25);

  const resultadoItems = document.querySelectorAll(".resultado-item");
  let y = 40;

  resultadoItems.forEach((item, i) => {
    const text = item.textContent.trim();
    doc.text(`${i + 1}. ${text}`, 10, y);
    y += 10;
  });

  const adubo = document.getElementById("recomendacaoAdubo").innerText;
  doc.text("Recomendação:", 10, y + 10);
  doc.text(adubo, 10, y + 20);

  // Exporta o gráfico como imagem e insere no PDF
  const canvas = document.getElementById('graficoNutrientes');
  const imgData = canvas.toDataURL("image/png");

  doc.addPage(); // nova página para o gráfico
  doc.setFontSize(14);
  doc.text("Gráfico de Nutrientes", 10, 15);
  doc.addImage(imgData, 'PNG', 10, 25, 180, 100); // (imagem, tipo, x, y, largura, altura)

  doc.save(`analise-solo-${nomeProdutor.replace(/\s+/g, "_")}.pdf`);
});
