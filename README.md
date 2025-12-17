# Gerador de Certificados SENAI CIMATEC

Esta é uma aplicação de geração de certificados desenvolvido para eventos SENAI CIMATEC. A aplicação permite criar certificados personalizados com processamento local de dados, garantindo segurança e privacidade.

## Recursos

- Geração de certificados personalizados com texto personalizado usando [NOME] como placeholder
- Upload de imagens de fundo em alta resolução (recomendado A4 em 300 DPI)
- Processamento de dados totalmente local (sem envio para servidores externos)
- Interface responsiva com design feito com BootStrap v. 5.0

## Como Usar

1. **Lista de Participantes**: 
   - Crie um arquivo CSV com uma coluna contendo os nomes dos participantes
   - Exemplo:
     ```
     Nome
     João Silva
     Maria Santos
     Pedro Costa
     ```

2. **Personalização**:
   - Defina o texto do certificado usando [NOME] como placeholder
   - Exemplo: "Certifico [NOME] por sua participação no evento"

3. **Imagem de Fundo**:
   - Use uma imagem com resolução mínima de 2480×3508 pixels
   - Formatos aceitos: PNG ou JPG

4. **Geração**:
   - Clique em "Gerar e Baixar Certificados (ZIP)"
   - Visualize o progresso na área de logs
   - Faça o download dos certificados quando concluído

## Tecnologias

- HTML5, CSS3 e JavaScript
- Processamento local usando bibliotecas JavaScript:
    1 - PDF: jsPDF versão 3.0.4
    2 - Parse do CSV para o PDF: Papa Parse versão 5.3.0
    3 - ZIP: JSZip versão 3.10.1
- Design responsivo feito com Bootstrap 5
- Bootstrap Icons

## Observações

- Todos os dados são processados localmente no navegador
- Nenhuma informação é enviada para servidores externos

## Autor

Wilton Gonçalves