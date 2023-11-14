const app = Vue.createApp({
    data() {
        return {
          searchQuery: "",
          fetchedData: [],
          page: 1
        };
    },
    methods: {
        async fetchBooks() {
            try {
                // Construct the query parameters
                const queryParams = new URLSearchParams({
                    search: this.searchQuery, 
                    page: this.page
                });
        
                // Make the request using fetch
                const response = await fetch(`http://localhost:3500/search?${queryParams.toString()}`);
        
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
        
                // Parse the JSON response
                const data = await response.json();
                const bookResultsArray = data['data'];
                console.log(bookResultsArray);
                this.fetchedData = bookResultsArray;
                console.log(this.fetchedData);
                return bookResultsArray;
            } catch (error) {
                console.error('Fetch error:', error);
            }
        }        
    }
});