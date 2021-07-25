function errorHandler(req: any, res: any, next: () => void) {
  const { error, userId, isAdmin } = req.params;
  if (error) {
    return res.status(403).send(`unauthorized : ${error}`);
  } else if (!userId) {
    return res.status(403).send("unauthorized User");
  } else if (isAdmin !== undefined && !isAdmin) {
    return res.status(403).send("you don't have admin permission");
  } else {
    next();
  }
}
export default errorHandler;
