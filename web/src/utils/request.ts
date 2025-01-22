const rootUrlApi = "http://localhost:2451";

async function getBusiness(topLevelDomain: string) {
    if(!topLevelDomain) {
        throw new Error('Invalid top level domain');
    }

    let url = null;
    if(process.env.ENVIRONMENT === 'production') {
        url = `${rootUrlApi}/business/${topLevelDomain}`;
    }
    else{
        url = `${rootUrlApi}/business/kerelski.com`;
    }
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
  
      const json = await response.json();
      console.log(json);

        return json;
    } catch (error: any) {
      console.error(error.message);
    }
}

export default getBusiness;

/*
2 vida greshki - sistemni i user(intput)
sistemni - vadqt se s tostera
input - vadqt se kato text nad/pot inputa 
pravqt se promisi sys ili bez danni v reject
ako vs e ok resolve s result
*/
