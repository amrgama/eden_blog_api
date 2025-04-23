export const injectReplays= (comments)=>{
    if(replayTo === undefined){
        return;
    }
    return 
}

function compine(comment, comments, newComments){
    if(!comment.length) return;
    
    if(comments[0].replayTo === comment.id){
        const [first, ...rest] = comments;
        return newComments.push(compine(comment, rest, newComments))
    }

    const [first, ...rest] = comments;
    compine(comment, rest, newComments);
}