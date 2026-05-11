export default function (req: any, res: any) {
  res.json({
    hasDbUrl: !!process.env.DATABASE_URL,
    dbUrlPrefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 15) : 'none',
    nodeEnv: process.env.NODE_ENV,
    time: new Date().toISOString()
  });
}
