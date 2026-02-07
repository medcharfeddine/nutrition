// Translation helper using Google Translate API
export async function translateToArabic(text: string): Promise<string> {
  try {
    // Using free translation API endpoint
    const response = await fetch('https://api.mymemory.translated.net/get', {
      method: 'GET',
      headers: {
        'User-Agent': 'NutriEd-App',
      },
    });

    if (!response.ok) {
      throw new Error('Translation API failed');
    }

    // MyMemory API format: https://api.mymemory.translated.net/get?langpair=en|ar&q=text
    const url = new URL('https://api.mymemory.translated.net/get');
    url.searchParams.append('langpair', 'fr|ar');
    url.searchParams.append('q', text);

    const result = await fetch(url.toString()).then((r) => r.json());

    if (result.responseStatus === 200) {
      return result.responseData.translatedText;
    } else {
      console.error('Translation failed:', result);
      return text; // Fallback to original text if translation fails
    }
  } catch (error) {
    console.error('Error translating text:', error);
    return text; // Fallback to original text on error
  }
}

// Batch translation for multiple texts
export async function translateMultipleToArabic(
  texts: string[]
): Promise<string[]> {
  try {
    const translations = await Promise.all(
      texts.map((text) => translateToArabic(text))
    );
    return translations;
  } catch (error) {
    console.error('Error batch translating:', error);
    return texts; // Fallback to original texts
  }
}
