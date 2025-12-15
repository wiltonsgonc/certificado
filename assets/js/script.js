let participantes = [];
let imagemFundo = null;

document.addEventListener('DOMContentLoaded', function() {
    const gerarBtn = document.getElementById('gerarCertificados');
    const participantesInput = document.getElementById('participantes');
    const textoCertificadoInput = document.getElementById('textoCertificado');
    const fundoCertificadoInput = document.getElementById('fundoCertificado');
    const previewDiv = document.getElementById('preview');

    // Carrega a imagem de fundo
    fundoCertificadoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                imagemFundo = event.target.result;
                
                // Mostra mensagem de sucesso
                showMessage('✓ Imagem de fundo carregada com sucesso!', 'success');
                updateButtonState();
            };
            reader.readAsDataURL(file);
        }
    });

    // Processa o arquivo CSV
    participantesInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            showMessage('Processando arquivo CSV...', 'info');
            
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: false,
                encoding: 'UTF-8',
                complete: function(results) {
                    console.log('CSV parseado:', results);
                    
                    // Limpa array anterior
                    participantes = [];
                    
                    // Processa cada linha
                    results.data.forEach((row, index) => {
                        console.log(`Linha ${index}:`, row);
                        
                        // Pula linhas completamente vazias
                        if (!row || Object.keys(row).length === 0) {
                            console.log(`Linha ${index} vazia, pulando...`);
                            return;
                        }
                        
                        // Tenta encontrar o nome
                        let nome = null;
                        
                        // Verifica colunas comuns (case insensitive)
                        const keys = Object.keys(row);
                        for (let key of keys) {
                            const lowerKey = key.toLowerCase();
                            if (lowerKey.includes('nome') || lowerKey.includes('name') || 
                                lowerKey.includes('participante') || lowerKey.includes('aluno')) {
                                if (row[key] && row[key].toString().trim() !== '') {
                                    nome = row[key].toString().trim();
                                    console.log(`Nome encontrado na coluna "${key}": ${nome}`);
                                    break;
                                }
                            }
                        }
                        
                        // Se não encontrou, pega o primeiro valor não vazio
                        if (!nome) {
                            for (let key of keys) {
                                if (row[key] && row[key].toString().trim() !== '') {
                                    nome = row[key].toString().trim();
                                    console.log(`Usando primeiro valor não vazio da coluna "${key}": ${nome}`);
                                    break;
                                }
                            }
                        }
                        
                        // Só adiciona se encontrou um nome válido
                        if (nome && nome !== '') {
                            participantes.push({
                                Nome: nome
                            });
                            console.log(`Adicionado participante: ${nome}`);
                        } else {
                            console.log(`Linha ${index} não contém nome válido, pulando...`);
                        }
                    });
                    
                    console.log('Total de participantes encontrados:', participantes.length);
                    console.log('Lista de participantes:', participantes);
                    
                    // Atualiza a visualização
                    if (participantes.length > 0) {
                        let html = `<div class="alert alert-success" role="alert">
                            <i class="bi bi-check-circle-fill me-2"></i>
                            Carregados ${participantes.length} participantes
                        </div>`;
                        html += '<div id="participantes-list" class="mt-3">';
                        participantes.forEach((p, i) => {
                            html += `<div class="alert alert-light border-start border-3 border-primary mb-2">
                                <i class="bi bi-person-circle me-2 text-primary"></i>
                                <strong>${i+1}.</strong> ${p.Nome}
                            </div>`;
                        });
                        html += '</div>';
                        previewDiv.innerHTML = html;
                        showMessage('✓ Lista de participantes carregada com sucesso!', 'success');
                    } else {
                        previewDiv.innerHTML = `
                            <div class="alert alert-danger" role="alert">
                                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                                Nenhum participante encontrado no arquivo CSV.
                            </div>
                            <div class="mt-3">
                                <p class="fw-bold">Formato esperado:</p>
                                <div class="bg-light p-3 rounded">
                                    <code class="text-dark">Nome<br>João Silva<br>Maria Santos<br>Pedro Costa</code>
                                </div>
                            </div>
                        `;
                    }
                    
                    updateButtonState();
                },
                error: function(error) {
                    console.error('Erro ao parsear CSV:', error);
                    showMessage(`Erro ao ler o arquivo CSV: ${error.message}`, 'danger');
                }
            });
        }
    });

    // Monitora mudanças nos campos de texto
    textoCertificadoInput.addEventListener('input', updateButtonState);

    // Atualiza estado do botão de gerar
    function updateButtonState() {
        const tudoPreenchido = participantes.length > 0 && 
                              imagemFundo && 
                              textoCertificadoInput.value.trim() !== '';
        
        gerarBtn.disabled = !tudoPreenchido;
        
        if (tudoPreenchido) {
            gerarBtn.classList.remove('btn-secondary');
            gerarBtn.classList.add('btn-primary');
            gerarBtn.title = 'Clique para gerar os certificados';
        } else {
            gerarBtn.classList.remove('btn-primary');
            gerarBtn.classList.add('btn-secondary');
            gerarBtn.title = 'Preencha todos os campos para habilitar';
        }
    }

    // Inicializa estado do botão
    updateButtonState();
    
    // Configura o evento de clique
    gerarBtn.addEventListener('click', gerarCertificados);
});

// Função para exibir mensagens
function showMessage(text, type = 'info') {
    const messageArea = document.getElementById('messageArea');
    const alertClass = {
        'success': 'alert-success',
        'danger': 'alert-danger',
        'warning': 'alert-warning',
        'info': 'alert-info'
    }[type] || 'alert-info';
    
    messageArea.innerHTML = `
        <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
            ${text}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
}

async function gerarCertificados() {
    const textoCertificadoInput = document.getElementById('textoCertificado');
    const previewDiv = document.getElementById('preview');
    const gerarBtn = document.getElementById('gerarCertificados');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const progressPercent = document.getElementById('progressPercent');

    // Validações finais
    if (participantes.length === 0) {
        showMessage('Por favor, carregue a lista de participantes.', 'danger');
        return;
    }
    
    if (!imagemFundo) {
        showMessage('Por favor, carregue uma imagem de fundo.', 'danger');
        return;
    }
    
    const textoCertificado = textoCertificadoInput.value.trim();
    if (!textoCertificado.includes('[NOME]')) {
        showMessage('O texto do certificado deve conter [NOME] para substituir pelo nome do participante.', 'warning');
    }
    
    // Mostrar progresso
    previewDiv.innerHTML = `
        <div class="text-center">
            <div class="spinner-border text-primary mb-3" role="status">
                <span class="visually-hidden">Carregando...</span>
            </div>
            <h5 class="text-primary">Gerando ${participantes.length} certificados...</h5>
            <p class="text-muted">Por favor, aguarde enquanto os certificados são processados.</p>
        </div>
    `;

    // Mostrar barra de progresso
    progressContainer.classList.remove('d-none');
    progressBar.style.width = '0%';
    progressPercent.textContent = '0%';

    // Desabilitar botão durante a geração
    gerarBtn.disabled = true;
    gerarBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Gerando...';
    gerarBtn.classList.remove('btn-primary');
    gerarBtn.classList.add('btn-secondary');

    try {
        // Verificar se jsPDF está disponível
        if (typeof window.jspdf === 'undefined') {
            throw new Error('Biblioteca jsPDF não carregada. Recarregue a página.');
        }
        
        const { jsPDF } = window.jspdf;
        const zip = new JSZip();
        const folder = zip.folder("certificados");

        console.log('Iniciando geração para', participantes.length, 'participantes:');
        console.log(participantes);

        // Para cada participante, gera um PDF
        let certificadosGerados = 0;
        for (let i = 0; i < participantes.length; i++) {
            const participante = participantes[i];
            const nome = participante.Nome;
            
            // Pular participantes sem nome válido
            if (!nome || nome.trim() === '' || nome.toLowerCase() === 'nome' || 
                nome.toLowerCase() === 'participante' || nome.toLowerCase() === 'aluno') {
                console.log(`Pulando participante ${i} - nome inválido: "${nome}"`);
                continue;
            }
            
            const nomeLimpo = nome.trim();
            console.log(`Gerando certificado ${i+1} para: "${nomeLimpo}"`);
            
            // Atualizar progresso
            certificadosGerados++;
            const progresso = Math.round((certificadosGerados / participantes.length) * 100);
            progressBar.style.width = `${progresso}%`;
            progressPercent.textContent = `${progresso}%`;
            
            // Criar PDF
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            // Adicionar imagem de fundo
            doc.addImage(imagemFundo, 'JPEG', 0, 0, 297, 210);

            // Título do certificado
            doc.setFont("helvetica", "bold");
            doc.setFontSize(32);
            doc.setTextColor(0, 0, 0);
            doc.text('CERTIFICADO', 148, 60, { align: 'center' });

            // Texto personalizado
            doc.setFont("times", "normal");
            doc.setFontSize(18);
            doc.setTextColor(0, 0, 0);
            
            // Substitui [NOME] pelo nome do participante
            const texto = textoCertificado.replace(/\[NOME\]/g, nomeLimpo);
            const lines = doc.splitTextToSize(texto, 240);
            
            // Posiciona o texto centralizado
            let yPos = 90;
            lines.forEach(line => {
                doc.text(line, 148, yPos, { align: 'center', maxWidth: 240 });
                yPos += 10;
            });

            // Converter para blob
            const blob = doc.output('blob');
            
            // Nome do arquivo seguro
            const nomeArquivo = `certificado_${nomeLimpo
                .replace(/[^\w\u00C0-\u00FF\s-]/gi, '') // Remove caracteres especiais, mantém letras, números, acentos, hífens
                .replace(/\s+/g, '_')
                .replace(/_+/g, '_')
                .toLowerCase()}.pdf`;
            
            console.log(`Salvando como: ${nomeArquivo}`);
            folder.file(nomeArquivo, blob);
            
            // Pequena pausa para não sobrecarregar
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        // Verificar se algum certificado foi gerado
        const fileCount = Object.keys(folder.files).length;
        if (fileCount === 0) {
            throw new Error('Nenhum certificado foi gerado. Verifique se os nomes no CSV são válidos.');
        }

        console.log(`Total de certificados gerados: ${fileCount}`);
        
        // Gerar arquivo ZIP
        progressBar.style.width = '100%';
        progressPercent.textContent = '100%';
        progressBar.classList.remove('progress-bar-animated');
        
        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);
        
        // Criar link de download
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificados_${new Date().toISOString().split('T')[0]}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Limpar URL
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 1000);

        // Mensagem de sucesso
        previewDiv.innerHTML = `
            <div class="alert alert-success" role="alert">
                <i class="bi bi-check-circle-fill me-2"></i>
                <strong>✓ Certificados gerados com sucesso!</strong>
            </div>
            <div class="text-center mt-4">
                <i class="bi bi-file-earmark-zip text-primary" style="font-size: 4rem;"></i>
                <h5 class="mt-3 text-primary">${fileCount} arquivos PDF gerados</h5>
                <p class="text-muted">O download do arquivo ZIP começou automaticamente.</p>
                <div class="alert alert-info mt-3">
                    <i class="bi bi-info-circle me-2"></i>
                    <small>Arquivos incluídos no ZIP:<br>
                    ${participantes.slice(0, 3).map(p => 
                        `• certificado_${p.Nome
                            .replace(/[^\w\u00C0-\u00FF\s-]/gi, '')
                            .replace(/\s+/g, '_')
                            .toLowerCase()}.pdf<br>`
                    ).join('')}
                    ${participantes.length > 3 ? `• ... e mais ${participantes.length - 3} arquivos` : ''}
                    </small>
                </div>
            </div>
        `;

        showMessage('✓ Download dos certificados iniciado com sucesso!', 'success');

    } catch (error) {
        console.error("Erro detalhado:", error);
        previewDiv.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                <strong>Erro ao gerar os certificados:</strong><br>
                ${error.message}
            </div>
        `;
        showMessage('Erro ao gerar certificados. Verifique os detalhes acima.', 'danger');
    } finally {
        // Reabilitar botão
        gerarBtn.disabled = false;
        gerarBtn.innerHTML = '<i class="bi bi-file-earmark-zip me-2"></i>Gerar e Baixar Certificados (ZIP)';
        gerarBtn.classList.remove('btn-secondary');
        gerarBtn.classList.add('btn-primary');
        
        // Esconder barra de progresso
        setTimeout(() => {
            progressContainer.classList.add('d-none');
            progressBar.classList.add('progress-bar-animated');
        }, 2000);
    }
}