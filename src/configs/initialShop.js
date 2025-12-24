
export default {
    POSs:[],  // สำหรับกำหนดเครื่องที่จะขาย
    address:'',
    attendance:[],
    branch:1,
    dateTime:new Date(),
    cutOff:new Date(2011, 0, 1, 0, 0, 0, 0),
    humanResource:[
      {
          email:'',
          name:'',
          notification:true,
          position:['001'],
          status:'active',
          tel:''
      }
    ],
    imageUrl:[],
    name:'',
    payment:[],
    position:[
      {
        id:'001',
        name:'เจ้าของร้าน',
        rights:['100','101','102','103','104','105','106',
                '107','108','109','110','111','112','113',
                '114','115','116','117','118','119','120',
                '121','122','123','124','125','126','127',
                '128','129','130','131','132','133','134',
                '135','136','137','138','139','140','141',
                '142','143','144','145','146','147','148',
                '149','150','151','152','153','154','155',
                '501','502','503','504','505','506','507',
                '508','509','510','511','512','513','514',
                '515','516','517','518','519','520','521',
                '522','523','524','525','526',
                '901'
              ]
      },
      {
        id:'002',
        name:'ผู้จัดการ',
        rights:['100','101','102','103','104','105','106',
                '107',
                '503','504','505','506','507','509','510',
                '511','512','515','516','517','519','520',
                '523',
              ]
      },
      {
        id:'004',
        name:'พนักงานขาย',
        rights:['100','101','106']
      },
    ],
    receipt:{
      footer:'Thank you & See you again:)',
      footerImage:{imageId:'',status:false},
      header:`บริษัท เฮง เฮง จำกัด
      444 Siam Aquare Soi 7, Rama 1 Road, 
      Pathumwan,Bangkok, 10330 Thailand
      TAX ID : 0105569384059 
      ใบเสร็จรับเงิน/ใบกำกับภาษีอย่างย่อ`,
      headerImage:{imageId:'',status:false},
      price:false, // กำหนดราคาต่อชิ้นได้
      bottomEnable:false, // ใส่หมายเหตุได้
      thankText:'ขอบคุณที่อุดหนุนนะคะ'
    },
    scShopId:'', // ร้านที่มีหลายสาขาจะมี scShopId ตรงกัน
    shift:false, // เปิดใช้งานระบบกะหรือไม่
    smartAddress:[],
    smartCategory:[],
    smartCoupon:[],
    smartPoint:[],
    tel:'',
    vip:[
      // {
      //   type:'pos',
      //   expire:new Date()
      // }
    ],
    soundPlayers:[],
    printers:[],
    notiImport:[],
    notiShift:[],
    notiStaff:[],
    notiStock:[],
    notiSummary:[],
    notiCancelBill:[],
    notiCheckin:[],
    notiCredit:[],
    notiRequisition:[],
    soundStatus:true,
    destinationAddress:[],
    creditPoint:true, // แต้มคนเซ็น
    imageLimit:100, // สามารถใส่รูปได้ฟรี 100 รูป
    imageMore:0,
    smartReward:[],
    shopchampPayment:[
      {
        id:1,
        name:'เงินสด',
        mortal:true,//ลบไม่ได้
        status:true
      },
      {
        id:2,
        name:'พร้อมเพย์',
        mortal:true,//ลบไม่ได้
        status:true
      },
      {
        id:3,
        name:'เงินเซ็น',
        mortal:true,//ลบไม่ได้
        status:false
      }
    ],
    tax:{},
    taxCustomer:[],
    line:{
      liff:'',
      channelAccessToken:'',
      userId:'',
    },
    lineNoti:{
      // member:[]
    },
    lineUsers:[
      // {
      //   id:1,
      //   name:''
      // }
    ],
    rounding:{
      status:false,
      type:'down'
    },
    logo:'',
    totalMember:0,
    shopchampVat:{
      status:true,
      value:{
        type:'Include',
        amount:'7'
      },
    },
    categoryExpense:[],
    customerAds:[],
    receiptPattern:'month', // ประเภทใบเสร็จ เรียงตามวัน หรือ เรียงตามเดือน
    wholesaleId:'', // รหัสลูกค้าสำหรับขายส่ง เอาไว้ดึงยอดขายฝั่งขายส่ง
  }