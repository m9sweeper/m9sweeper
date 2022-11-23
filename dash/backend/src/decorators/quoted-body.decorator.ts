import {createParamDecorator, ExecutionContext} from "@nestjs/common";
export const QuotedBody = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    let body: string = request.body;
    if (body.startsWith('"') && body.endsWith('"')) {
        body = body.slice(1, body.length - 1);
    }

    body = (body + '')
        .replace(/\\(.?)/g, function (s, n1) {
            switch (n1) {
                case '\\':
                    return '\\'
                case '0':
                    return '\u0000'
                case '':
                    return ''
                default:
                    return n1
            }
        })

    return JSON.parse(body);
});