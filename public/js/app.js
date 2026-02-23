document.getElementById('toggleTheme')?.addEventListener('click', () => {
  const html = document.documentElement;
  html.setAttribute('data-bs-theme', html.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark');
});

const quoteForm = document.getElementById('quoteForm');
if (quoteForm) {
  quoteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(quoteForm);
    const response = await fetch('/orcamento', { method: 'POST', body: formData });
    const data = await response.json();
    document.getElementById('quoteResult').textContent = JSON.stringify(data, null, 2);
  });
}

if (window.dashboardData && document.getElementById('ordersChart')) {
  const labels = window.dashboardData.map((i) => i.mes);
  const pedidos = window.dashboardData.map((i) => Number(i.pedidos));
  const faturamento = window.dashboardData.map((i) => Number(i.faturamento));

  new Chart(document.getElementById('ordersChart'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Pedidos', data: pedidos },
        { label: 'Faturamento', data: faturamento, type: 'line' }
      ]
    }
  });
}
