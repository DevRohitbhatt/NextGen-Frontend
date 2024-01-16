import { useEffect } from "react"

export default function PrepChart() {

    //Temporary API call to test it is working.
    //Todo: move this to a specific API calling section of the code.
    useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await axios.get('https://localhost:7264/api/GetApp3Params?encryptedParams=' + document.location.href)
            console.log(response.data)
          } catch (error) {
            console.error(error)
          }
        }
    
        fetchData()
    }, [])

    return (
        <div>
            <div className="pageTitle">Prep Chart</div>
        </div>
    )
} 