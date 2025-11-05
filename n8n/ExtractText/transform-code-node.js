// n8n Code Node: Transform markdown array to text string
// Run Once for All Items

const items = $input.all();

const transformedItems = items.map(item => {
  const inputData = item.json;
  
  // Extract markdown array from input
  let textContent = '';
  
  if (inputData.markdown && Array.isArray(inputData.markdown)) {
    // Join all markdown array elements into a single text string
    textContent = inputData.markdown.join('\n\n');
    
    // Clean up markdown formatting for plain text
    textContent = textContent
      // Remove markdown headers (# ## ###)
      .replace(/^#{1,6}\s+/gm, '')
      // Remove markdown bold/italic (**text** or *text*)
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      // Remove markdown links [text](url)
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove image markdown ![alt](url)
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
      // Remove table formatting pipes and alignment
      .replace(/\|/g, ' ')
      .replace(/:-+:/g, '')
      .replace(/:-+/g, '')
      // Remove excessive whitespace
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+/g, ' ')
      // Trim leading/trailing whitespace
      .trim();
  } else if (typeof inputData === 'string') {
    // If input is already a string, use it directly
    textContent = inputData;
  } else {
    // Fallback: stringify the entire object
    textContent = JSON.stringify(inputData);
  }
  
  // Return in the expected format
  return {
    json: {
      text: textContent
    }
  };
});

return transformedItems;
