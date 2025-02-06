import { DescribeCollectionCommand } from "@aws-sdk/client-rekognition";

export default class Patterns {
    static getNubank(texts) 
    {
        try {
            const foundTime = texts.match(/(?<data>[0-9]+\s[JANFEVMARABRMAIJUNJULAGOSETOUTNOVDEZ]+\s\d{4}).+(?<hours>\d{2}\:\d{2}\:\d{2})/);
            const foundValue = texts.match(/(?<valor>R\$\s\d{1,5},\d{2})/);
            const names = texts.match(/Nome\s*(?<name>.+)/g);
        
           const result = {
                datetime    : `${foundTime.groups.data} - ${foundTime.groups.hours}`,
                value       : foundValue.groups.valor,
                destination : names[0].replace("Nome\n", ""),
                origin      : names[1].replace("Nome\n", "")
            }

            
            return result;
        }
        catch(e) {
            console.log(e);
            
        }

    }

    static getBB(texts) 
    {
        try {
            const foundTime = texts.match(/DATA:\s(?<data>\d{2}\/\d{2}\/\d{4}).+(?<hours>\d{2}\:\d{2}\:\d{2})/);
            const foundValue = texts.match(/(?<valor>R\$\d{1,5},\d{2})/);
            const origin = texts.match(/CLIENTE:\s(?<origin>.+)/);
            const destination = texts.match(/PAGO PARA:\s(?<destination>.+)/);
            const result = {
                datetime    : `${foundTime.groups.data} - ${foundTime.groups.hours}`,
                value       : foundValue.groups.valor,
                destination : destination.groups.destination,
                origin      : origin.groups.origin
            }

            return result;
        }
        catch(e) {
            console.log(e);
            
        }

    }


} 


    // static resolveName(texts, key) 
    // {
        
    //     const first = texts.match(/Destino\s*(?<name>.+)/);
    //     const second = texts.match(/Nome\s*(?<name>.+)/);
    //     console.log("first", first[key], second[key] )
    //     return `${ first[key]} ${second[key]}`;
    // }

// const names = [];
// for(let i = 0; i < foundNames.length; i++) {
//     console.log(foundNames[i].replace("Nome\n", "") )
//     console.log(/^[A-Z\s]+$/.test( foundNames[i].replace("Nome\n", "") ))
//     if( /[^A-Z\s]+$/.test( foundNames[i].replace("Nome\n", "") )) {
//         names.push( Patterns.resolveName( texts, i ) )
//     } else {
     
//         names.push( foundNames[i].replace("Nome\n", "") )
//     }

// }
// console.log(names);