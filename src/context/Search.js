

// const getSearchProd = useCallback(async (prodSearch) => {
       
//     if(!prodSearch || prodSearch.length === 0){
//         getProds()
//         return
//     }
//     try{
//         const { data } = await API.get(`/produto/search/?query=${prodSearch}`);
        
//         if (data) {
//             setTot(data.count)
//             setProds(data.results);
//             setNextPage(data.next)
//             setPreviousPage(data.previous)
//         } else {
//             setProds([])

//         }
//     } catch (error) {
//         console.error('Erro ao buscar produto:', error);
//     }
// }, [getProds]);