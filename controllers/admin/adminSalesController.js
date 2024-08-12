const Order = require('../../models/ordersModel')
const pdfDocument = require('pdfkit')
const excelJs = require('exceljs')
const getSalesReport = async (req, res) => {
    try {
        const page = req.query.page || 1
        const limit = 5
        const skip = (page - 1) * limit
        const dateDivision = req.params.id
        console.log(dateDivision)
        const theOrder= await Order.find({})
        const totalOrders = await  Order.countDocuments()
        console.log('this is req.query', req.query)
        let startDate = req.query.fromDate || null
        let endDate = req.query.toDate || null
        console.log('this is start date', startDate)
        console.log('this is endDate:', endDate)
        if (dateDivision) {
            if (dateDivision === 'weekly') {
                startDate = new Date();
                startDate.setDate(startDate.getDate() - 7);
                endDate = new Date();
            } else if (dateDivision === 'monthly') {
                startDate = new Date();
                startDate.setMonth(startDate.getMonth() - 1);
                endDate = new Date();
            } else if (dateDivision === 'yearly') {
                startDate = new Date();
                startDate.setFullYear(startDate.getFullYear() - 1);
                endDate = new Date();
            } else if (dateDivision === 'lastday') {
                startDate = new Date()
                startDate.setHours(startDate.getHours() - 12);
                endDate = new Date()
            }
        }

        if (startDate && endDate) {
            startDate = new Date(startDate);
            endDate = new Date(endDate);
            matchCriteria.orderDate = {
                $gte: startDate,
                $lte: endDate
            };
        } else {
            matchCriteria = {}
        }
        console.log('this is start date', startDate, 'and this is end date', endDate)
        const order = await Order.aggregate([
            { $match: matchCriteria },
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.productId',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            { $unwind: '$productDetails' },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'usersDetails'
                }
            },
            { $unwind: '$usersDetails' },
            {
                $project: {
                    _id: 1,
                    orderId: 1,
                    userId: 1,
                    orderDate: 1,
                    'usersDetails.name': 1,
                    'items.quantity': 1,
                    'items.price': 1,
                    'items.discountedPrice': 1,
                    'items.totalPrice': 1,
                    'items.itemStatus': 1,
                    'productDetails.name': 1,
                    'paymentMethod': 1,
                    'paymentStatus': 1,
                    'orderStatus': 1,
                    'refundAmount': 1,
                    'offerAmount': ''
                }
            },

        ])
        const orders = await Order.aggregate([
            { $match: matchCriteria },
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.productId',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            { $unwind: '$productDetails' },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'usersDetails'
                }
            },
            { $unwind: '$usersDetails' },
            {
                $project: {
                    _id: 1,
                    orderId: 1,
                    userId: 1,
                    orderDate: 1,
                    'usersDetails.name': 1,
                    'items.quantity': 1,
                    'items.price': 1,
                    'items.discountedPrice': 1,
                    'items.totalPrice': 1,
                    'items.itemStatus': 1,
                    'productDetails.name': 1,
                    'paymentMethod': 1,
                    'paymentStatus': 1,
                    'orderStatus': 1,
                    'refundAmount': 1,
                    'offerAmount': 1,
                }
            },
            { $skip: skip },
            { $limit: limit }
        ])
        const totalCount = order.length
        console.log('total count:', totalCount)
        let totalSale=0
        let totalDiscount = 0
        theOrder.forEach(order=>{
            totalSale+=order.totalAmount
            totalDiscount+=order.offerAmount
        })

        res.status(200).render('admin/adminSalesReport', {
            orders,
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
            searchterm: '',
            totalSale,
            totalOrders,
            totalDiscount
        })
    } catch (err) {
        console.log(err)
        res.status(500).render('500/500erroradmin')
    }
}
const getPdfReport = async (req, res) => {
    try {
        console.log('this is pdf method')
        const orders = await Order.aggregate([
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.productId',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            { $unwind: '$productDetails' },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'usersDetails'
                }
            },
            { $unwind: '$usersDetails' },
            {
                $project: {
                    _id: 1,
                    orderId: 1,
                    userId: 1,
                    orderDate: 1,
                    'usersDetails.name': 1,
                    'items.quantity': 1,
                    'items.price': 1,
                    'items.discountedPrice': 1,
                    'items.totalPrice': 1,
                    'items.itemStatus': 1,
                    'productDetails.name': 1,
                    'paymentMethod': 1,
                    'paymentStatus': 1,
                    'orderStatus': 1,
                    'refundAmount': 1,
                    'offerAmount': 1,
                }
            },

        ])
        const order=await Order.find({})
        let totalSale=0
        let totalOffer=0
        order.forEach(order=>{
            console.log('this is totalAmount:',order.totalAmount)
            totalSale+=order.totalAmount
            totalOffer+=order.offerAmount
        })
        const totalCount=await Order.countDocuments()
       const doc = new pdfDocument()
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', 'attachment; filename=sales_report.pdf')
        doc.pipe(res)
        doc.fontSize(18).text('Sales Report', { align: 'center' })
        doc.moveDown()
        orders.forEach(order => {
            doc.fontSize(12).text(`Order Id : ${order.orderId}`)
            doc.text(`User : ${order.usersDetails.name}`)
            doc.text(`Product : ${order.productDetails.name}`)
            doc.text(`Quantity : ${order.items.quantity}`)
            doc.text(`Price : ${order.items.price}`)
            doc.text(`Total Price : ${order.items.totalPrice}`)
            doc.text(`Order Date : ${order.orderDate}`)
            doc.text(`Payment Method : ${order.paymentMethod}`)
            doc.text(`Order Status : ${order.orderStatus}`)
            doc.moveDown()

        })
        doc.fontSize(15).text(`Total Sale : ${totalSale}`)
        doc.fontSize(15).text(`Total Orders : ${totalCount}`)
        doc.fontSize(15).text(`Total Offer given : ${totalOffer}`)
        doc.end()
    } catch (err) {
        console.error(err)
        res.status(500).render('500/500erroradmin')
    }
}
const getExcelReport = async (req, res) => {
    try {
        console.log('this is excel method')
        const orders = await Order.aggregate([
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.productId',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            { $unwind: '$productDetails' },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'usersDetails'
                }
            },
            { $unwind: '$usersDetails' },
            {
                $project: {
                    _id: 1,
                    orderId: 1,
                    userId: 1,
                    orderDate: 1,
                    'usersDetails.name': 1,
                    'items.quantity': 1,
                    'items.price': 1,
                    'items.discountedPrice': 1,
                    'items.totalPrice': 1,
                    'items.itemStatus': 1,
                    'productDetails.name': 1,
                    'paymentMethod': 1,
                    'paymentStatus': 1,
                    'orderStatus': 1,
                    'refundAmount': 1,
                    'offerAmount': 1,
                }
            },

        ])
        const workBook = new excelJs.Workbook()
        const workSheet = workBook.addWorksheet('Sales Report')
        workSheet.columns = [
            { header: 'Order ID', key: 'orderId', width: 15 },
            { header: 'User', key: 'user', width: 20 },
            { header: 'Product', key: 'product', width: 20 },
            { header: 'Quantity', key: 'quantity', width: 10 },
            { header: 'Price', key: 'price', width: 10 },
            { header: 'Total Price', key: 'totalPrice', width: 15 },
            { header: 'Order Date', key: 'orderDate', width: 20 },
            { header: 'Payment Method', key: 'paymentMethod', width: 15 },
            { header: 'Order Status', key: 'orderStatus', width: 15 }
        ]
        orders.forEach(order => {
            workSheet.addRow({
                orderId: order.orderId,
                user: order.usersDetails.name,
                product: order.productDetails.name,
                quantity: order.items.quantity,
                price: order.items.quantity,
                price: order.items.price,
                totalPrice: order.items.totalPrice,
                orderDate: order.orderDate,
                paymentMethod: order.paymentMethod,
                orderStatus: order.orderStatus
            })
        })
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        res.setHeader('Content-Disposition', 'attachment;filename=sales_report.xlsx')
        await workBook.xlsx.write(res)
        res.end()
    } catch (err) {
        console.error(err)
        res.status(500).render('500/500erroradmin')
    }
}
const getData = async (req, res) => {
    try {
        const dateDivision = req.params.id;
        const matchCriteria = {};
        let startDate, endDate;
        let groupByFormat;

        if (dateDivision === 'daily') {
            startDate = new Date();
            startDate.setDate(startDate.getDate() - 1);
            endDate = new Date();
            groupByFormat = "%Y-%m-%d"; 

        } else if (dateDivision === 'weekly') {
            startDate = new Date();
            startDate.setDate(startDate.getDate() - 7);
            endDate = new Date();
            groupByFormat = "%Y-%m-%d"; 

        } else if (dateDivision === 'monthly') {
            startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 12); 
            endDate = new Date();
            groupByFormat = "%Y-%m"; 

        } else if (dateDivision === 'yearly') {
            startDate = new Date();
            startDate.setFullYear(startDate.getFullYear() - 10); 
            endDate = new Date();
            groupByFormat = "%Y"; 
        }

        if (startDate && endDate) {
            matchCriteria.orderDate = {
                $gte: startDate,
                $lte: endDate
            };
        }

        const orderData = await Order.aggregate([
            { $match: matchCriteria },
            { $unwind: '$items' },
            {
                $group: {
                    _id: {
                        $dateToString: { format: groupByFormat, date: "$orderDate" }
                    },
                    totalSales: { $sum: '$items.totalPrice' },
                    totalOrders: { $sum: 1 },
                }
            },
            { $sort: { _id: 1 } } 
        ]);

        res.json(orderData);

    } catch (err) {
        console.error('Error in getData:', err);
        res.status(500).render('500/500erroradmin');
    }
};

module.exports = {
    getSalesReport,
    getPdfReport,
    getExcelReport,
    getData
}