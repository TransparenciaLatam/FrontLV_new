  // Area Charts for each category
  function createAreaChart(chartId, value, color, label) {
    const ctx = document.getElementById(chartId).getContext('2d');
    return new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        datasets: [{
          label: label,
          data: [80, 70, 60, 90, value - 5, value],
          backgroundColor: color.replace(')', ', 0.2)').replace('rgb', 'rgba'),
          borderColor: color,
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.parsed.y + '%';
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function(value) {
                return value + '%';
              }
            }
          }
        }
      }
    });
  }

   // Plugin reutilizable para centrar texto
  const centerTextPlugin = {
    id: 'centerText',
    beforeDraw: function(chart) {
      const { width, height, ctx } = chart;
      ctx.save();

      const fontSize = 20;
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.fillStyle = chart.config.options.plugins.centerText.color || '#000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const value = chart.config.options.plugins.centerText.text;
      const x = width / 2;
      const y = height / 1.50;

      ctx.fillText(value, x, y);
      ctx.restore();
    }
  };

  //Derechos Humanos
  new Chart(document.getElementById("derechosChart"), {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [80, 20],
        backgroundColor: [
          'rgb(249, 115, 22)', // naranja
          '#e5e7eb' // gris claro
        ],
        borderWidth: 0
      }]
    },
    options: {
      rotation: -90,
      circumference: 180,
      cutout: '75%',
      plugins: {
        tooltip: { enabled: false },
        legend: { display: false },
        centerText: {
          text: '80%',
          color: 'rgb(249, 115, 22)'
        }
      }
    },
    plugins: [centerTextPlugin]
  });

// Estandares Laborales
  new Chart(document.getElementById("estandaresChart"), {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [70, 30],
        backgroundColor: ['rgb(14, 165, 233)', '#e5e7eb'],
        borderWidth: 0
      }]
    },
    options: {
      rotation: -90,
      circumference: 180,
      cutout: '75%',
      plugins: {
        tooltip: { enabled: false },
        legend: { display: false },
        centerText: {
          text: '70%',
          color: 'rgb(14, 165, 233)'
        }
      }
    },
    plugins: [centerTextPlugin]
  });

  // Medio Ambiente
  new Chart(document.getElementById("medioAmbienteChart"), {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [60, 40],
        backgroundColor: ['rgb(16, 185, 129)', '#e5e7eb'],
        borderWidth: 0
      }]
    },
    options: {
      rotation: -90,
      circumference: 180,
      cutout: '75%',
      plugins: {
        tooltip: { enabled: false },
        legend: { display: false },
        centerText: {
          text: '60%',
          color: 'rgb(16, 185, 129)'
        }
      }
    },
    plugins: [centerTextPlugin]
  });

  // Integridad
  new Chart(document.getElementById("integridadChart"), {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [90, 10],
        backgroundColor: ['rgb(139, 92, 246)', '#e5e7eb'],
        borderWidth: 0
      }]
    },
    options: {
      rotation: -90,
      circumference: 180,
      cutout: '75%',
      plugins: {
        tooltip: { enabled: false },
        legend: { display: false },
        centerText: {
          text: '90%',
          color: 'rgb(139, 92, 246)'
        }
      }
    },
    plugins: [centerTextPlugin]
  });

  // Confetti effect for medal
  const medalRange = parseInt('75.00%');
  if (medalRange >= 60) {
    startConfetti();
  }

  function startConfetti() {
    const duration = 5000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      }));
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      }));
    }, 250);
  }




  function shareOnLinkedIn() {
    const postText = encodeURIComponent("I completed a Due Diligence Report! Check out the findings. #DueDiligence #BusinessEthics #Compliance");
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}&text=${postText}`;
    window.open(linkedInUrl, '_blank');
  }