# Description
根據給定公車方向跟停靠站點，在指定公車站前3~5站發出通知，使用console.log。
使用ptx公共運輸整合資訊平台api取得公車資料。
* [Official Sample Code](https://github.com/ptxmotc/Sample-code)
* [PTX API](https://ptx.transportdata.tw/MOTC/)

# Run
```bash
yarn test
```
# Config
* city : 城市
* routeName : 公車號碼/名稱
* targetStopName : 指定公車站名稱
* direction : 公車方向
* taskInterval : 每一次check的間隔時間
* taskTotalRunTime : 執行總時間