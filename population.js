const Promise = require('bluebird');
const axios = require('axios');

const url = 'http://api.population.io:80/1.0/';
const country = 'Belarus';
const year = 2017;
const urlsFraCanGer =
    [axios.get(url + `population/2017/France`),
    axios.get(url + `population/2017/Canada`),
    axios.get(url + `population/2017/Germany`)];
const urlsBel =
    [axios.get(url + `population/2014/Belarus/25`),
    axios.get(url + `population/2015/Belarus/25`)];
const maleMoratalityGre = axios.get(url + `mortality-distribution/Greece/male/0y/today/`);
const femaleMoratalityGre = axios.get(url + `mortality-distribution/Greece/female/0y/today/`);
const maleMoratalityTur = axios.get(url + `mortality-distribution/Turkey/male/0y/today/`);
const femaleMoratalityTur = axios.get(url + `hmortality-distribution/Turkey/female/0y/today/`);
let totalMalePopulationFraCanGer = 0;
let totalFemalePopulationFraCanGer = 0;
let maxMaleMortalityGre = 0;
let maxMaleMortalityInAgeGre = 0;
let maxFemaleMortalityGre = 0;
let maxFemaleMortalityInAgeGre = 0;
let maxMaleMortalityTur = 0;
let maxMaleMortalityInAgeTur = 0;
let maxFemaleMortalityTur = 0;
let maxFemaleMortalityInAgeTur = 0;

axios.get(url + `population/${year}/${country}/`)
    .then((res) => {
        const population = res.data;
        let totalPopulationBel = 0;
        population.forEach((populationInAge) => {
            totalPopulationBel += populationInAge.total;
        })
        console.log(`Population of Belarus is ${totalPopulationBel}`);
    }).catch((err) => {
        console.error(err);
    })

Promise.all(urlsFraCanGer)
    .then((res) => {
        res.forEach((all) => {
            all.data.forEach((population) => {
                totalMalePopulationFraCanGer += population.males;
                totalFemalePopulationFraCanGer += population.females;
            })
        })
        console.log(`Total male population in France,Canada,Germany: ${totalMalePopulationFraCanGer}`);
        console.log(`Total female population in France,Canada,Germany: ${totalFemalePopulationFraCanGer}`);
    }).catch((err) => {
        console.error(err);
    })

Promise.any(urlsBel).then((res) => {
    console.log(`Population of Belarus in ${res.data[0].year},males:${res.data[0].males},females:${res.data[0].females}, in age:${res.data[0].age}`);
}).catch((err) => {
    console.error(err);
})

Promise.props({
    maleMoratalityGre: maleMoratalityGre,
    femaleMoratalityGre: femaleMoratalityGre,
    maleMoratalityTur: maleMoratalityTur,
    femaleMoratalityTur: femaleMoratalityTur
}).then((res) => {
    const allAboutMalesMorGre = res.maleMoratalityGre.data.mortality_distribution;
    const allAboutFemalesMorGre = res.femaleMoratalityGre.data.mortality_distribution;
    const allAboutMalesMorTur = res.maleMoratalityTur.data.mortality_distribution;
    const allAboutFemalesMorTur = res.femaleMoratalityTur.data.mortality_distribution;
    allAboutMalesMorGre.forEach((m) => {
        if (m.mortality_percent > maxMaleMortalityGre) {
            maxMaleMortalityGre = m.mortality_percent;
            maxMaleMortalityInAgeGre = m.age;
        }
    });
    console.log(`Max mortality males in Greece in  age :${maxMaleMortalityInAgeGre}`);
    allAboutFemalesMorGre.forEach((m) => {
        if (m.mortality_percent > maxFemaleMortalityGre) {
            maxFemaleMortalityGre = m.mortality_percent;
            maxFemaleMortalityInAgeGre = m.age;
        }
    });
    console.log(`Max mortality females in Greece in  age :${maxFemaleMortalityInAgeGre}`);
    allAboutMalesMorTur.forEach((m) => {
        if (m.mortality_percent > maxMaleMortalityTur) {
            maxMaleMortalityTur = m.mortality_percent;
            maxMaleMortalityInAgeTur = m.age;
        }
    });
    console.log(`Max mortality males in Turkey in  age :${maxMaleMortalityInAgeTur}`);
    allAboutFemalesMorTur.forEach((m) => {
        if (m.mortality_percent > maxFemaleMortalityTur) {
            maxFemaleMortalityTur = m.mortality_percent;
            maxFemaleMortalityInAgeTur = m.age;
        }
    });
    console.log(`Max mortality females in Turkey in  age :${maxFemaleMortalityInAgeTur}`);
}).catch((err) => {
    console.error(err);
})

const yearA = 2007;
axios.get(url + 'countries').then(results => {
    const allCountries = results.data.countries;
    const countries = [];
    for (let i = 0; i < 5; i++) {
        countries.push(url + `population/${yearA}/${allCountries[i]}/`);
    }
    Promise.map(countries,(country)=>axios.get(country)).then(result => {
        const population = result;
        for (let someCountry of population) {
            let totalPopulation = 0;
            const countryPopulation = someCountry.data;  
            for (let someAged of countryPopulation) {
                totalPopulation += someAged.total;
            }
            console.log(`Population of ${countryPopulation[0].country} is ${totalPopulation}`);
        }
    }).catch((err) => {
        console.error(err);
    })
})



