
const TMDB_API_KEY = '4ea270f32fe4e8fcdfd68b4cd5a7074f';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export async function fetchFromTmdb(endpoint: string, params: string = '') {
  const url = `${TMDB_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}&language=pt-BR&${params}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erro na API TMDB: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar dados do TMDB:', error);
    return null;
  }
}
