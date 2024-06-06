const express = require('express')
const cors = require('cors')

const PORT = 8080
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true}))
app.use(cors({
  origin: '*'
}))
app.listen(PORT, ()=> {console.log(`Server listening on port ${PORT}`)})

app.post('/create-products', async (req,res)=>{

    const {imageUrl} = req.body
    const url = 'https://api.printify.com/v1/shops/11847788/products.json'
    const products = [
        {
            title: 'Shirt',
            blueprintId: 145,
            description: 'Gildan T Shirt',
            printProviderID: 29,
            variants: [
                38162, 38176, 38190, 38204, 38218, 42119,
                38163, 38177, 38191, 38205, 38219, 42120,
                38164, 38178, 38192, 38206, 38220, 42122
            ],
            placeholders: ["front"],
            price: 4262
        },
        {
            title: 'Hoodie',
            blueprintId: 77,
            description: 'Gildan Hoodie',
            printProviderID: 29,
            variants: [
                32902, 32903, 32904, 32905, 32906, 32907, 32908, 32909,
                32910, 32911, 32912, 32913, 32914, 32915, 32916, 32917,
                32918, 32919, 32920, 32921, 32922, 32923, 32924, 32925
            ],
            placeholders: ["front"],
            price: 7499

        },
        {
            title: 'Underwear',
            blueprintId: 77,
            description: 'Mens Underwear',
            printProviderID: 51,
            variants: [
                103939, 103942, 103945, 103951
            ],
            placeholders: ["back"],
            price: 6402
        },
        {
            title: 'Socks',
            blueprintId: 376,
            description: 'Socks',
            printProviderID: 1,
            variants: [
                45132, 45133, 45134
            ],
            placeholders: ["front right leg", "back right leg"],
            price: 3455
        },
        {
            title: 'Blanket',
            blueprintId: 522,
            description: 'Blanket',
            printProviderID: 1,
            variants: [
                68322, 68323, 68324
            ],
            placeholders: ["front"],
            price: 6067
        },
        {
            title: 'Cup',
            blueprintId: 618,
            description: 'Cup',
            printProviderID: 41,
            variants: [
                72109, 75533, 77203
            ],
            placeholders: ["front"],
            price: 4413
        },
        {
            title: 'Phone Cases',
            blueprintId: 269,
            description: 'Phone Cases',
            printProviderID: 1,
            variants: [
                42386, 42387, 42390, 45160, 45161, 45162, 62582, 62583, 62584,
                70871, 70872, 70873, 70874, 76611, 76612, 76613, 76614, 93905,
                93906, 93907, 93908, 103561, 103562, 103563, 103564, 105527,
                105528, 105529, 105530
            ],
            placeholders: ["front"],
            price: 3804
        }
    ]
    const responses = []

    try {
        for (const product of products) {
            try {
                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzN2Q0YmQzMDM1ZmUxMWU5YTgwM2FiN2VlYjNjY2M5NyIsImp0aSI6Ijg5NGFhYmVhNmY2MjE0ZTAzYzg5YjE4N2EzYmQ4YWI5ZjE4NzI1NWRiMmE1NmRjMThlMTQ1Yzk5YWNiZWQ5ZDNkYmJmYzQ1NWI3OWY0YjFlIiwiaWF0IjoxNzE3NDU5MzM2LjgxNjQ4OSwibmJmIjoxNzE3NDU5MzM2LjgxNjQ5MSwiZXhwIjoxNzQ4OTk1MzM2LjgwODA0OSwic3ViIjoiMTUyODk2NzUiLCJzY29wZXMiOlsic2hvcHMubWFuYWdlIiwic2hvcHMucmVhZCIsImNhdGFsb2cucmVhZCIsIm9yZGVycy5yZWFkIiwib3JkZXJzLndyaXRlIiwicHJvZHVjdHMucmVhZCIsInByb2R1Y3RzLndyaXRlIiwid2ViaG9va3MucmVhZCIsIndlYmhvb2tzLndyaXRlIiwidXBsb2Fkcy5yZWFkIiwidXBsb2Fkcy53cml0ZSIsInByaW50X3Byb3ZpZGVycy5yZWFkIl19.AI3jWWcfEDGtIBtNM3lnlsu-cMje2kme6iDx9ILUjgfxl98kJHOXPYITxapRH9JVO7t6Q8Qbu9RryQ37NF0" // Add your API token here
                    },
                    body: JSON.stringify({
                        title: product.title,
                        description: product.description,
                        blueprint_id: product.blueprintId,
                        print_provider_id: product.printProviderID,
                        variants: product.variants.map(variantId => ({
                            id: variantId,
                            price: product.price,
                            is_enabled: true
                        })),
                        print_areas: [
                            {
                                variant_ids: product.variants,
                                placeholders: product.placeholders.map(placeholder => ({
                                    position: placeholder,
                                    images: [
                                        {
                                            id: imageUrl,
                                            x: 0.5,
                                            y: 0.5,
                                            scale: 1,
                                            angle: 0
                                        }
                                    ]
                                }))
                            }
                        ]
                    })
                });

                if (!response.ok) {
                    throw new Error(`Error creating product ${product.title}`);
                }

                const resBody = await response.json();
                console.log('Response:', resBody);
                responses.push(resBody);
            } catch (error) {
                console.error('Error:', error.message);
            }
        }

        res.json({ responses });

    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
})