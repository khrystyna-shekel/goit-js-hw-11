import axios from "axios";


const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '40750466-a9a3b4ee49fa6557c8d09caed';

export default class PixabayApi {
    constructor(){
        this.page = 1;
        this.PER_PAGE = 40;
        this.searchQuery = '';
    }
    
    async fetchGallery() {
        const axiosOptions = {
            method: 'get',
            url: `${BASE_URL}`,
            params: {
                key: `${API_KEY}`,
                q: `${this.searchQuery}`,
                image_type: 'photo',
                orientation: 'horizontal',
                safesearch: true,
                page: `${this.page}`,
                per_page: `${this.PER_PAGE}`,
            },
        };
        try {
            const response = await axios(axiosOptions);
            const data = response.data;
            if (data.hits.length === 0) {
                this.resetEndOfHits();
                return null;
        }
            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    incrementPage() {
        this.page += 1;
    }

    resetPage() {
        this.page = 1;
    }

    resetEndOfHits() {
        this.endOfHits = false;
    }

    get query() {
        return this.searchQuery;
    }

    set query(newQuery) {
        this.searchQuery = newQuery;
    }
}
