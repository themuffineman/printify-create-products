const express = require('express')
const cors = require('cors')
require('dotenv').config();

const PORT = 8080
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true}))
app.use(cors({
  origin: '*'
}))
app.listen(PORT, ()=> {console.log(`Server listening on port ${PORT}`)})

app.post('/create-products', async (req,res)=>{
    console.log('Received a request')
    const body = req.body
    console.log(body)
    return res.status(200).json({good: 'all good'})
    const imageUrl = modifyUrl(body.imageUrl)
    const url = 'https://api.printify.com/v1/shops/11847788/products.json'
    const uploadImageUrl = 'https://api.printify.com/v1/uploads/images.json'
    const responses = []
    const apiResponse = []


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

    try {

        const imageID = await fetch(uploadImageUrl, {method:"POST", headers:{"Content-Type": "application/json", "Authorization": `${process.env.BEARER_KEY}`}, body: JSON.stringify({
            "file_name": "TestingImage.png",
            "url": `${imageUrl}`
        })})
        const imageIDBody = await imageID.json()

        for (const product of products) {
            try {
                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `${process.env.BEARER_KEY}`
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
                                            id: imageIDBody.id,
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
                
                const responseBody = await response.json();

                try {
                    const res = await fetch(`https://api.printify.com/v1/shops/11847788/products/${responseBody.id}.json`, {method: "GET", headers:{"Content-Type": "application/json", "Authorization": `${process.env.BEARER_KEY}`}})

                    if(!res.ok){
                        throw new Error('Error fetching mockups')
                    }

                    const resBody = await res.json()

                    const mockupImages = resBody.images.map((image)=>{
                        return {
                            images: image.src,
                            variants: image.variant_ids
                        }
                    }) 

                    apiResponse.push({
                        id: response.id,
                        images: mockupImages,
                        blueprintId: product.blueprintId,
                        price: product.price
                    })
                } catch (error) {
                   console.error(error.message) 
                }

            } catch (error) {
                console.error('Error:', error.message);
            }
        }

        // for(const response of responses){
        //     try {
        //         const res = await fetch(`https://api.printify.com/v1/shops/11847788/products/${response.id}.json`, {method: "GET", headers:{"Content-Type": "application/json", "Authorization": `${process.env.BEARER_KEY}`}})
        //         if(!res.ok){
        //             throw new Error('Error fetching mockups')
        //         }
        //         const resBody = await res.json()
        //         const mockupImages = resBody.images.map((image)=>{
        //             return image.src
        //         })
        //         apiResponse.push({
        //             id: response.id,
        //             images: mockupImages,
                    
        //         })
        //     } catch (error) {
        //        console.error(error.message) 
        //     }
        // }

        res.json({ response: apiResponse });

    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }

})

function modifyUrl(url){
    let newUrl

    if (url.startsWith('//')) {
        newUrl = 'https:' + url;  
    }else if (!url.startsWith('http://') && !url.startsWith('https://')) {
        newUrl = 'https://' + url; 
    }else{
        newUrl = url
    }

    return newUrl
}
