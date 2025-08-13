let chart; // referência do gráfico Chart.js

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

  const atual = [], minimos = [], maximos = [];

  for (const nutriente in valores) {
    const valor = valores[nutriente];
    const ideal = ideais[nutriente];
    let status, classe;

    if (valor < ideal.min) {
      status = "Baixo"; classe = "baixo";
    } else if (valor > ideal.max) {
      status = "Alto"; classe = "alto";
    } else {
      status = "Adequado"; classe = "bom";
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

function gerarGrafico(labels, atual, min, max) {
  const ctx = document.getElementById('graficoNutrientes').getContext('2d');

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Valor Atual', data: atual, backgroundColor: '#007bff' },
        { label: 'Mínimo Ideal', data: min, backgroundColor: '#ffc107' },
        { label: 'Máximo Ideal', data: max, backgroundColor: '#28a745' }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: 'Comparação dos Nutrientes' }
      }
    }
  });
}

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

// PDF otimizado para etiqueta MDK-081 (72mm de largura)
document.getElementById("btnPdf").addEventListener("click", function () {
  const { jsPDF } = window.jspdf;
  
  // Formato 72 mm x 100 mm
  const doc = new jsPDF({ unit: 'mm', format: [72, 100] });

  const nomeProdutor = document.getElementById("produtor").value;

  let y = 5;
  doc.setFontSize(10);
  doc.text("Análise de Solo", 2, y);
  y += 5;

  doc.setFontSize(8);
  doc.text(`Produtor: ${nomeProdutor}`, 2, y);
  y += 4;

  const resultadoItems = document.querySelectorAll(".resultado-item");
  resultadoItems.forEach((item) => {
    const text = item.textContent.trim();
    doc.text(text, 2, y);
    y += 4;
  });

  const adubo = document.getElementById("recomendacaoAdubo").innerText;
  y += 2;
  doc.text("Recomendação:", 2, y);
  y += 4;
  doc.text(doc.splitTextToSize(adubo, 68), 2, y);
  y += 10;

  // Insere o gráfico reduzido
  const canvas = document.getElementById('graficoNutrientes');
  const imgData = canvas.toDataURL("image/png");
  doc.addImage(imgData, 'PNG', 2, y, 68, 30);

  doc.save(`etiqueta_${nomeProdutor.replace(/\s+/g, "_")}.pdf`);
});
