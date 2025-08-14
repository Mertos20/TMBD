import { useParams } from "react-router-dom";
import DetailPage from "./pages/DetailPage";
import MovieCategoryPage from "./pages/MovieCategoryPage"

export default function RouteHandler() {
  const { type, param } = useParams();

  if (!type || !param) return <div>Not found</div>;

  const isId = /^\d+$/.test(param); // param sayısal mı? ID ise true

  return isId ? (
    <DetailPage id={param} type={type} />
  ) : (
    <MovieCategoryPage category={param} type={type} />
  );
}
