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
                previewDiv.innerHTML = '<p class="success">✓ Imagem de fundo carregada!</p>';
                updateButtonState();
            };
            reader.readAsDataURL(file);
        }
    });

    // Processa o arquivo CSV
    participantesInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            previewDiv.innerHTML = '<p>Processando arquivo CSV...</p>';
            
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
                        let html = `<p class="success">✓ Carregados ${participantes.length} participantes:</p>`;
                        html += '<div id="participantes-list" style="text-align: left;">';
                        participantes.forEach((p, i) => {
                            html += `<p><strong>${i+1}.</strong> ${p.Nome}</p>`;
                        });
                        html += '</div>';
                        previewDiv.innerHTML = html;
                    } else {
                        previewDiv.innerHTML = `
                            <p class="error">Nenhum participante encontrado no arquivo CSV.</p>
                            <p>Formato esperado:</p>
                            <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; text-align: left;">
Nome
João Silva
Maria Santos
Pedro Costa</pre>
                        `;
                    }
                    
                    updateButtonState();
                },
                error: function(error) {
                    console.error('Erro ao parsear CSV:', error);
                    previewDiv.innerHTML = `<p class="error">Erro ao ler o arquivo CSV: ${error.message}</p>`;
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
            gerarBtn.style.backgroundColor = '#4CAF50';
            gerarBtn.title = 'Clique para gerar os certificados';
        } else {
            gerarBtn.style.backgroundColor = '#cccccc';
            gerarBtn.title = 'Preencha todos os campos para habilitar';
        }
    }

    // Inicializa estado do botão
    updateButtonState();
    
    // Configura o evento de clique
    gerarBtn.addEventListener('click', gerarCertificados);
});

async function gerarCertificados() {
    const textoCertificadoInput = document.getElementById('textoCertificado');
    const previewDiv = document.getElementById('preview');
    const gerarBtn = document.getElementById('gerarCertificados');

    // Validações finais
    if (participantes.length === 0) {
        previewDiv.innerHTML = '<p class="error">Por favor, carregue a lista de participantes.</p>';
        return;
    }
    
    if (!imagemFundo) {
        previewDiv.innerHTML = '<p class="error">Por favor, carregue uma imagem de fundo.</p>';
        return;
    }
    
    const textoCertificado = textoCertificadoInput.value.trim();
    
    // Mostrar progresso
    previewDiv.innerHTML = `
        <p>Gerando ${participantes.length} certificados...</p>
        <div style="background: #f0f0f0; border-radius: 4px; height: 20px; margin: 10px 0;">
            <div id="progressBar" style="background: #4CAF50; height: 100%; width: 0%; border-radius: 4px; transition: width 0.3s;"></div>
        </div>
        <p id="progressText">0% - Preparando...</p>
    `;

    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');

    // Desabilitar botão durante a geração
    gerarBtn.disabled = true;
    gerarBtn.textContent = 'Gerando...';
    gerarBtn.style.backgroundColor = '#cccccc';

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
            progressText.textContent = `${progresso}% - Gerando: ${nomeLimpo}`;
            
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
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Verificar se algum certificado foi gerado
        const fileCount = Object.keys(folder.files).length;
        if (fileCount === 0) {
            throw new Error('Nenhum certificado foi gerado. Verifique se os nomes no CSV são válidos.');
        }

        console.log(`Total de certificados gerados: ${fileCount}`);
        
        // Gerar arquivo ZIP
        progressText.textContent = '100% - Criando arquivo ZIP...';
        
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
            <p class="success">✓ Certificados gerados com sucesso!</p>
            <p><strong>${fileCount} arquivos PDF</strong> foram criados e compactados.</p>
            <p>O download começou automaticamente.</p>
            <p style="font-size: 12px; color: #666; margin-top: 10px;">
                Arquivos incluídos no ZIP:
                ${participantes.slice(0, 5).map(p => 
                    `<br>- certificado_${p.Nome
                        .replace(/[^\w\u00C0-\u00FF\s-]/gi, '')
                        .replace(/\s+/g, '_')
                        .toLowerCase()}.pdf`
                ).join('')}
                ${participantes.length > 5 ? `<br>... e mais ${participantes.length - 5}` : ''}
            </p>
        `;

    } catch (error) {
        console.error("Erro detalhado:", error);
        previewDiv.innerHTML = `
            <p class="error">Erro ao gerar os certificados:</p>
            <p>${error.message}</p>
            <p style="font-size: 12px;">Verifique o console do navegador (F12) para detalhes.</p>
        `;
    } finally {
        // Reabilitar botão
        gerarBtn.disabled = false;
        gerarBtn.textContent = 'Gerar e Baixar Certificados (ZIP)';
        gerarBtn.style.backgroundColor = '#4CAF50';
    }
}