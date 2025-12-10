// Função para gerar cor consistente baseada no texto da subcategoria
export const getSubcategoryColor = (subcategory: string) => {
  const colors = [
    { bg: '#FFE5E5', text: '#E63946' }, // Rosa/Vermelho
    { bg: '#FFF3E0', text: '#FB8500' }, // Laranja
    { bg: '#FFF9C4', text: '#FFB700' }, // Amarelo
    { bg: '#E8F5E9', text: '#2D6A4F' }, // Verde
    { bg: '#E3F2FD', text: '#1976D2' }, // Azul
    { bg: '#F3E5F5', text: '#7B1FA2' }, // Roxo
    { bg: '#FCE4EC', text: '#C2185B' }, // Pink
    { bg: '#E0F2F1', text: '#00796B' }, // Teal
  ];
  
  // Gerar hash do texto para ter uma cor consistente
  let hash = 0;
  for (let i = 0; i < subcategory.length; i++) {
    hash = subcategory.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};
