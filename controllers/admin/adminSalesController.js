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
        console.log('this is req.query',req.query)
        let startDate = req.query.fromDate || null
        let endDate = req.query.toDate || null
        
        if (dateDivision) {
            if (dateDivision === 'weekly') {
                startDate = new Date();
                startDate.setDate(startDate.getDate() - 7);
                endDate = new Date();
            } else if (dateDivision === 'monthly') {
                startDate = new Date();
                startDate.setDate(startDate.getMonth() - 1);
                endDate = new Date();
            } else if (dateDivision === 'yearly') {
                startDate = new Date();
                startDate.setDate(startDate.getFullYear() - 1);
                endDate = new Date();
            }
        }

        if (startDate && endDate) {
            matchCriteria.orderDate = {
              $gte: startDate,
              $lte: endDate
            };
          }else{
            matchCriteria={}
          }
          console.log('this is start date',startDate,'and this is end date',endDate)
        const order = await Order.aggregate([
            {$match : matchCriteria},
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
            {$match : matchCriteria},
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
       
        res.status(200).render('admin/adminSalesReport', {
            orders,
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
            searchterm: ''
        })
    } catch (err) {
        console.log(err)
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
        doc.end()
    } catch (err) {
        console.error(err)
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
    }
}

module.exports = {
    getSalesReport,
    getPdfReport,
    getExcelReport,
   
}