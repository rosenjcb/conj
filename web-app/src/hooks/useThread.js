import { useLocation } from 'react-router-dom';

export const useThread = () => {
    const location = useLocation();

    const pathSlugs = location.pathname.split("/"); 

    // const finalSlug = pathSlugs[slugCount - 1].match(/(\d+)/);

    if(pathSlugs.length < 2) {
        return {
            board: null,
            threadNo: null,
            replyNo: null
        };
    }

    const board = pathSlugs[1] === "boards" ? pathSlugs[2] : null;

    const threadSlug = pathSlugs[3] === "thread" ? pathSlugs[4] : null;

    const threadNo = threadSlug ? parseInt(threadSlug) ?? 0 : null; 

    const hash = location.hash.substring(1);

    const replyNo = hash ? Number(hash) : null;

    return {
        board: board,
        threadNo: threadNo,
        replyNo 
    };
}
