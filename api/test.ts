export default function (req: any, res: any) {
  res.json({ message: "Test OK", env: !!process.env.DATABASE_URL });
}
