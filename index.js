// required modules
const text_summarise = require("text-summarisation")
const readline = require("readline")
const https = require("https");
const fs = require("fs")

const API_URL = "https://api.diffbot.com/v3/article";



function ask_for_link(query) {
    const read_line = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    return new Promise(resolve => read_line.question(query, ans => {
        read_line.close();
        resolve(ans);
    }));
}


async function get_summary(data,num_sentence) {
    const text = data;
    var generated_summary;
    await text_summarise(text, { sentences: num_sentence })
        .then((summary) => {
            generated_summary = summary;
        })
        .catch(err => console.log(err));
    
    return generated_summary;
}


function get_article_data(article_link) {
    
    let params = {
        token: "5f7b5b91a2472e23c11d0424f7012cec",
        url: article_link
    }

    const url_parameters = new URLSearchParams(params).toString();
    const url_string = API_URL + "?" + url_parameters;

    https.get( url_string, (response) => {
        let data = "";
        response.on('data', (data_chunk) => {data += data_chunk;});

        response.on('end',
            async () => {
                data = JSON.parse(data);
                // console.log(data)

                data.objects[0]["summaryText"] = await get_summary(data.objects[0].text, 2);
                let file_data = JSON.stringify(data, null, 2);
                fs.writeFileSync("./output.json", file_data);
                
                console.log("Success : the data is stored in 'output.json' file")
            });
        
    }).on("error", (err) => {
        console.log("error : " + err.message);
    });

}


// process initialisation
ask_for_link("enter the link : ")
    .then((article_link) => {get_article_data(article_link);});
