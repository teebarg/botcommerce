from fastapi import APIRouter, Depends, Path, Request

from app.core.dependencies.album import AlbumDep
from app.core.permissions import require_admin
from app.models.album import AlbumCreate, AlbumCreated, AlbumPublic, AlbumSummary
from app.models.generic import Message
from app.services.cache import cacheable

router = APIRouter()


@router.get("/", dependencies=[Depends(require_admin)])
async def index(srv: AlbumDep) -> list[AlbumSummary]:
    return await srv.list()


@router.post("/", dependencies=[Depends(require_admin)])
async def create(data: AlbumCreate, srv: AlbumDep) -> AlbumCreated:
    code = await srv.create(title=data.title, product_ids=data.product_ids)
    return AlbumCreated(code=code, url=srv.url(code))


@router.get("/{code}")
@cacheable(
    key_prefix="album",
    key_builder=lambda code: code,
    tags=["albums", "products"],
    expire=300,
    cdn_ttl=300,
    cdn_swr=60,
)
async def read(
    request: Request,
    srv: AlbumDep,
    code: str = Path(..., pattern=r"^[a-z0-9]{6,32}$"),
) -> AlbumPublic:
    return await srv.get_public(code)


@router.delete("/{code}", dependencies=[Depends(require_admin)])
async def delete(
    srv: AlbumDep, code: str = Path(..., pattern=r"^[a-z0-9]{6,32}$")
) -> Message:
    await srv.delete(code)
    return Message(message="Album deleted")