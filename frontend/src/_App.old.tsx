import { useState, useEffect } from 'react';

import axios from 'axios';

import { ArrowUp, ArrowDown, Book, Zap, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

import { cn } from "@/lib/utils";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { Skeleton } from "@/components/ui/skeleton";

import { Separator } from "@/components/ui/separator";

import { clsx, type ClassValue } from 'clsx';



function App() {

const [realtimeData, setRealtimeData] = useState({

orderbook: { bids: [], asks: [] },

fundingRate: null,

tradeVolume: { buy_volume: null, sell_volume: null, timestamp: null },

liquidation: null,

});

const [historicalData, setHistoricalData] = useState({

orderbook: [],

fundingRate: [],

tradeVolume: [],

liquidation: [],

});

const [loading, setLoading] = useState(true);

const [error, setError] = useState(null);

const [noLiquidationMessage, setNoLiquidationMessage] = useState('');



useEffect(() => {

const fetchRealtimeData = async () => {

try {

const [orderbookRes, fundingRateRes, tradeVolumeRes, liquidationRes] = await Promise.all([

axios.get('http://localhost:8000/api/realtime/orderbook/'),

axios.get('http://localhost:8000/api/realtime/funding_rate/'),

axios.get('http://localhost:8000/api/realtime/trade_volume/'),

axios.get('http://localhost:8000/api/realtime/liquidation/'),

]);



// 실시간 데이터 로깅

console.log('Realtime Data:', {

orderbook: orderbookRes.data,

fundingRate: fundingRateRes.data,

tradeVolume: tradeVolumeRes.data,

liquidation: liquidationRes.data,

});



const liquidationData =

liquidationRes.data && liquidationRes.data.status !== 'no_realtime_data'

? {

side: liquidationRes.data.last_liquidation.side || 'N/A',

price: parseFloat(liquidationRes.data.last_liquidation.price || 0),

quantity: parseFloat(liquidationRes.data.last_liquidation.quantity || 0),

timestamp: liquidationRes.data.last_liquidation.timestamp

? new Date(liquidationRes.data.last_liquidation.timestamp).toLocaleString()

: 'N/A',

}

: null;



setRealtimeData({

orderbook: {

bids: orderbookRes.data.b || [],

asks: orderbookRes.data.a || [],

},

fundingRate: fundingRateRes.data

? {

fundingRate: parseFloat(fundingRateRes.data.fundingRate),

fundingTime: fundingRateRes.data.fundingTime

? new Date(fundingRateRes.data.fundingTime).toLocaleString()

: 'N/A',

}

: null,

tradeVolume: tradeVolumeRes.data || null,

liquidation: liquidationData,

});



// 청산 데이터가 없는 경우 메시지 설정

if (liquidationRes.data && liquidationRes.data.status === 'no_realtime_data') {

setNoLiquidationMessage(liquidationRes.data.message || '실시간 청산 데이터가 없습니다.');

} else {

setNoLiquidationMessage(''); // 메시지 초기화

}

} catch (err) {

console.error('실시간 데이터 가져오기 오류:', err.message);

setError(err);

}

};



const fetchHistoricalData = async () => {

try {

const [orderbook, fundingRate, tradeVolume, liquidation] = await Promise.all([

axios.get('http://localhost:8000/api/historical/orderbook/'),

axios.get('http://localhost:8000/api/historical/funding_rate/'),

axios.get('http://localhost:8000/api/historical/trade_volume/'),

axios.get('http://localhost:8000/api/historical/liquidation/'),

]);

// 과거 데이터 로깅

console.log('Historical Data:', {

orderbook: orderbook.data,

fundingRate: fundingRate.data,

tradeVolume: tradeVolume.data,

liquidation: liquidation.data,

});

setHistoricalData({

orderbook: orderbook.data,

fundingRate: fundingRate.data,

tradeVolume: tradeVolume.data,

liquidation: liquidation.data, // 과거 청산 데이터 설정

});

} catch (err) {

console.error('과거 데이터 가져오기 오류:', err);

setError(err);

} finally {

setLoading(false);

}

};



setLoading(true);

fetchRealtimeData();

fetchHistoricalData();

const interval = setInterval(fetchRealtimeData, 1000);

return () => clearInterval(interval);

}, []);



if (loading) {

return (

<div className="min-h-screen bg-gray-950 text-white p-4 md:p-6 flex items-center justify-center">

<div className="space-y-4">

<p className="text-lg">실시간 및 과거 데이터 로딩 중...</p>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

<Card><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>

<Card><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>

<Card><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>

<Card><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>

</div>

</div>

</div>

);

}



if (error) {

return (

<div className="min-h-screen bg-gray-950 text-white p-4 md:p-6 flex items-center justify-center">

<Card className="w-full max-w-2xl">

<CardHeader>

<CardTitle className="text-red-500 flex items-center gap-2">

<AlertCircle className="w-5 h-5" />

오류

</CardTitle>

<CardDescription>데이터를 가져오는 중 오류가 발생했습니다: {error.message}</CardDescription>

</CardHeader>

</Card>

</div>

);

}



return (

<div className="min-h-screen bg-gray-950 text-white p-4 md:p-6">

<div className="max-w-7xl mx-auto space-y-8">

<h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">

BTCUSDT 시장 현황

</h1>



<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">

{/* Funding Rate 카드 */}

<Card className="transition-all duration-300 hover:shadow-lg hover:border-gray-700 border-gray-800 bg-gray-900">

<CardHeader>

<CardTitle className="flex items-center gap-2">

<Zap className="w-5 h-5 text-blue-400" />

Funding Rate

</CardTitle>

<CardDescription>현재 펀딩 비율</CardDescription>

</CardHeader>

<CardContent>

{realtimeData.fundingRate ? (

<div className="space-y-2">

<p className="text-lg">

<span className="font-semibold">Rate:</span>{' '}

<Badge

variant={realtimeData.fundingRate.fundingRate > 0 ? "success" : "destructive"}

className={cn(

'font-semibold',

realtimeData.fundingRate.fundingRate > 0

? 'bg-green-500/20 text-green-400 border-green-500/30'

: 'bg-red-500/20 text-red-400 border-red-500/30'

)}

>

{parseFloat(realtimeData.fundingRate.fundingRate * 100).toFixed(4)}%

</Badge>

</p>

<p className="text-sm text-gray-500">

<span className="font-medium">Time:</span> {realtimeData.fundingTime || 'N/A'}

</p>

</div>

) : (

<p className="text-gray-500">데이터 없음</p>

)}

</CardContent>

</Card>



{/* Trade Volume 카드 */}

<Card className="transition-all duration-300 hover:shadow-lg hover:border-gray-700 border-gray-800 bg-gray-900">

<CardHeader>

<CardTitle className="flex items-center gap-2">

<TrendingUp className="w-5 h-5 text-green-400" />

Trade Volume

</CardTitle>

<CardDescription>최근 거래량</CardDescription>

</CardHeader>

<CardContent>

{realtimeData.tradeVolume ? (

<div className="space-y-2">

<p className="text-lg">

<span className="font-bold text-green-400 flex items-center">

<ArrowUp className="w-4 h-4 mr-1" />

Buy:

</span>{' '}

{realtimeData.tradeVolume.buy_volume.toFixed(4)}

</p>

<p className="text-lg">

<span className="font-bold text-red-400 flex items-center">

<ArrowDown className="w-4 h-4 mr-1" />

Sell:

</span>{' '}

{realtimeData.tradeVolume.sell_volume.toFixed(4)}

</p>

{realtimeData.tradeVolume.timestamp && (

<p className="text-sm text-gray-500">

<span className="font-medium">Time:</span>{' '}

{new Date(realtimeData.tradeVolume.timestamp).toLocaleString()}

</p>

)}

</div>

) : (

<p className="text-gray-500">데이터 없음</p>

)}

</CardContent>

</Card>



{/* Recent Liquidation 카드 */}

<Card className="transition-all duration-300 hover:shadow-lg hover:border-gray-700 border-gray-800 bg-gray-900 flex flex-col">

<CardHeader>

<CardTitle className="flex items-center gap-2">

<Zap className="w-5 h-5 text-red-400" />

Recent Liquidation

</CardTitle>

<CardDescription>최근 청산 내역</CardDescription>

</CardHeader>

<CardContent className="flex-1">

{realtimeData.liquidation ? (

<div className="space-y-2">

<p className="text-sm">

<span className="font-semibold">Side:</span>{' '}

<span

className={cn(

realtimeData.liquidation.side === 'BUY' ? 'text-green-400' : 'text-red-400'

)}

>

{realtimeData.liquidation.side}

</span>

</p>

<p className="text-sm">

<span className="font-semibold">Price:</span>{' '}

{realtimeData.liquidation.price ? realtimeData.liquidation.price.toFixed(2) : 'N/A'}

</p>

<p className="text-sm">

<span className="font-semibold">Quantity:</span>{' '}

{realtimeData.liquidation.quantity ? realtimeData.liquidation.quantity.toFixed(4) : 'N/A'}

</p>

<p className="text-sm text-gray-500">

<span className="font-medium">Time:</span> {realtimeData.liquidation.timestamp || 'N/A'}

</p>

</div>

) : (

<p className="text-gray-500">

{noLiquidationMessage || '청산 데이터 없음'}

</p>

)}

{historicalData.liquidation && historicalData.liquidation.length > 0 && (

<div className="mt-4 pt-4 border-t border-gray-700">

<h4 className="text-sm font-medium text-gray-400 mb-2">과거 청산 기록 (최근 3개)</h4>

<ul className="text-xs space-y-1">

{historicalData.liquidation.slice(-3).map((item, index) => (

<li key={index} className="py-1">

<span className={item.side === 'BUY' ? 'text-green-400' : 'text-red-400'}>

{item.side}

</span>{' '}

- {parseFloat(item.price).toFixed(2)} ({parseFloat(item.quantity).toFixed(4)})

</li>

))}

</ul>

</div>

)}

</CardContent>

</Card>



{/* Order Book Top 5 카드 */}

<Card className="transition-all duration-300 hover:shadow-lg hover:border-gray-700 border-gray-800 bg-gray-900">

<CardHeader>

<CardTitle className="flex items-center gap-2">

<Book className="w-5 h-5 text-purple-400" />

Order Book Top 5

</CardTitle>

<CardDescription>현재 호가 (매수/매도 상위 5개)</CardDescription>

</CardHeader>

<CardContent>

<div className="grid grid-cols-2 gap-4">

<div>

<h3 className="text-md font-medium mb-2 text-green-400">Bids</h3>

<ul className="text-sm space-y-1">

{realtimeData.orderbook.bids &&

realtimeData.orderbook.bids.slice(0, 5).map(([price, quantity], index) => (

<li key={index} className="py-1">

<span className="font-semibold">{parseFloat(price).toFixed(2)}</span> (

{parseFloat(quantity).toFixed(2)})

</li>

))}

</ul>

</div>

<div>

<h3 className="text-md font-medium mb-2 text-red-400">Asks</h3>

<ul className="text-sm space-y-1">

{realtimeData.orderbook.asks &&

realtimeData.orderbook.asks.slice(0, 5).map(([price, quantity], index) => (

<li key={index} className="py-1">

<span className="font-semibold">{parseFloat(price).toFixed(2)}</span> (

{parseFloat(quantity).toFixed(2)})

</li>

))}

</ul>

</div>

</div>

</CardContent>

</Card>

</div>

<Separator className="bg-gray-700" />

{/* Historical Data 생략 (필요한 경우 여기에 추가) */}

</div>

</div>

);

}



export default App;