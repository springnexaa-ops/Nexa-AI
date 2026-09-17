const DEFAULT_LAT=34.0837;
const DEFAULT_LON=74.7973;
const DEFAULT_NAME='Srinagar, Jammu & Kashmir';

function json(data: unknown,status=200,extra?:HeadersInit){
  return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'public, max-age=300, s-maxage=300',...extra}});
}

export async function weatherResponse(request:Request):Promise<Response>{
  const url=new URL(request.url);
  const lat=Number(url.searchParams.get('lat')??DEFAULT_LAT);
  const lon=Number(url.searchParams.get('lon')??DEFAULT_LON);
  if(!Number.isFinite(lat)||!Number.isFinite(lon)||lat<-90||lat>90||lon<-180||lon>180)return json({error:'Invalid coordinates'},400);
  const roundedLat=Math.round(lat*10000)/10000;
  const roundedLon=Math.round(lon*10000)/10000;
  const isDefault=roundedLat===DEFAULT_LAT&&roundedLon===DEFAULT_LON;
  const upstream=`https://api.open-meteo.com/v1/forecast?latitude=${roundedLat}&longitude=${roundedLon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto&forecast_days=1`;
  const cacheKey=new Request(upstream,{method:'GET'});
  const cache=await caches.open('nexa-weather-v1');
  const hit=await cache.match(cacheKey);
  if(hit){const data=await hit.json() as Record<string,unknown>;return json({...data,...(isDefault?{location_name:DEFAULT_NAME}:{})},200,{'x-nexa-weather-cache':'HIT'});}
  try{
    const upstreamResponse=await fetch(upstream,{headers:{accept:'application/json'}});
    if(!upstreamResponse.ok)return json({error:'Weather provider unavailable'},502);
    const data=await upstreamResponse.json() as Record<string,unknown>;
    const payload={...data,...(isDefault?{location_name:DEFAULT_NAME}:{})};
    const response=new Response(JSON.stringify(payload),{status:200,headers:{'content-type':'application/json; charset=utf-8','cache-control':'public, max-age=300, s-maxage=300','x-nexa-weather-cache':'MISS'}});
    await cache.put(cacheKey,response.clone());
    return response;
  }catch{return json({error:'Weather provider request failed'},502)}
}
