# Calculadora Alvo4SAT-ProV1.1

Calculadora independente extraída do Alvo4SAT-Pro. Registre os impactos tocando no alvo ou usando os botões 0, 3, 4 e 5 de cada cor. Os lançamentos por botão geram marcas dentro da região correspondente, evitando sobreposição.

- 24 tiros, máximo de 120 pontos.
- APTO: pontuação líquida de 72 pontos (60%) ou mais após os 24 tiros.
- INAPTO: pontuação líquida abaixo de 72 após os 24 tiros.
- Tiro fora do alvo conta um tiro de zero pontos.
- Penalidade manual desconta 5 pontos, sem acrescentar um tiro. Para um tiro penalizado, lance zero no impacto e depois a penalidade.
- Desfazer remove o último lançamento, inclusive penalidades.
- Limpar prova apaga os impactos, as penalidades e os dados salvos desta calculadora.
- Progresso salvo localmente no navegador, separado do aplicativo completo.

Esta versão não contém sequência, voz, timer, Start, dados do aluno, fotos ou laudos. O resultado considera apenas a pontuação do alvo de quatro cores.

Desenvolvedor: Marcelo Seixas, instrutor de tiro e policial penal de Santa Catarina.

Aplicação estática sem dependências. Para testar: `python -m http.server 8000` na raiz do repositório.
