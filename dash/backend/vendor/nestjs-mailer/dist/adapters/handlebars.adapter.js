"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandlebarsAdapter = void 0;
const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");
const glob = require("glob");
const lodash_1 = require("lodash");
class HandlebarsAdapter {
    constructor(helpers) {
        this.precompiledTemplates = {};
        handlebars.registerHelper('concat', (...args) => {
            args.pop();
            return args.join('');
        });
        handlebars.registerHelper(helpers || {});
    }
    compile(mail, callback, mailerOptions) {
        const precompile = (template, callback, options) => {
            const templateExt = path.extname(template) || '.hbs';
            const templateName = path.basename(template, path.extname(template));
            const templateDir = template.startsWith('./')
                ? path.dirname(template)
                : lodash_1.get(options, 'dir', '');
            const templatePath = path.join(templateDir, templateName + templateExt);
            if (!this.precompiledTemplates[templateName]) {
                try {
                    const template = fs.readFileSync(templatePath, 'utf-8');
                    this.precompiledTemplates[templateName] = handlebars.compile(template, lodash_1.get(options, 'options', {}));
                }
                catch (err) {
                    return callback(err);
                }
            }
            return {
                templateExt,
                templateName,
                templateDir,
                templatePath,
            };
        };
        const { templateName } = precompile(mail.data.template, callback, mailerOptions.template);
        const runtimeOptions = lodash_1.get(mailerOptions, 'options', {
            partials: false,
            data: {},
        });
        if (runtimeOptions.partials) {
            const files = glob.sync(path.join(runtimeOptions.partials.dir, '*.hbs'));
            files.forEach((file) => {
                const { templateName, templatePath } = precompile(file, () => { }, runtimeOptions.partials);
                handlebars.registerPartial(templateName, fs.readFileSync(templatePath, 'utf-8'));
            });
        }
        mail.data.html = this.precompiledTemplates[templateName](mail.data.context, Object.assign(Object.assign({}, runtimeOptions), { partials: this.precompiledTemplates }));
        return callback();
    }
}
exports.HandlebarsAdapter = HandlebarsAdapter;
