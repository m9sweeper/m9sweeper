import { Framework } from './framework.mjs';
import { hasOwn } from '../shared/utility.functions.mjs';
import { Inject, Injectable } from '@angular/core';
import { WidgetLibraryService } from '../widget-library/widget-library.service.mjs';
import * as i0 from "@angular/core";
import * as i1 from "../widget-library/widget-library.service.mjs";
// Possible future frameworks:
// - Foundation 6:
//   http://justindavis.co/2017/06/15/using-foundation-6-in-angular-4/
//   https://github.com/zurb/foundation-sites
// - Semantic UI:
//   https://github.com/edcarroll/ng2-semantic-ui
//   https://github.com/vladotesanovic/ngSemantic
export class FrameworkLibraryService {
    constructor(frameworks, widgetLibrary) {
        this.frameworks = frameworks;
        this.widgetLibrary = widgetLibrary;
        this.activeFramework = null;
        this.loadExternalAssets = false;
        this.frameworkLibrary = {};
        this.frameworks.forEach(framework => this.frameworkLibrary[framework.name] = framework);
        this.defaultFramework = this.frameworks[0].name;
        this.setFramework(this.defaultFramework);
    }
    setLoadExternalAssets(loadExternalAssets = true) {
        this.loadExternalAssets = !!loadExternalAssets;
    }
    setFramework(framework = this.defaultFramework, loadExternalAssets = this.loadExternalAssets) {
        this.activeFramework =
            typeof framework === 'string' && this.hasFramework(framework) ?
                this.frameworkLibrary[framework] :
                typeof framework === 'object' && hasOwn(framework, 'framework') ?
                    framework :
                    this.frameworkLibrary[this.defaultFramework];
        return this.registerFrameworkWidgets(this.activeFramework);
    }
    registerFrameworkWidgets(framework) {
        return hasOwn(framework, 'widgets') ?
            this.widgetLibrary.registerFrameworkWidgets(framework.widgets) :
            this.widgetLibrary.unRegisterFrameworkWidgets();
    }
    hasFramework(type) {
        return hasOwn(this.frameworkLibrary, type);
    }
    getFramework() {
        if (!this.activeFramework) {
            this.setFramework('default', true);
        }
        return this.activeFramework.framework;
    }
    getFrameworkWidgets() {
        return this.activeFramework.widgets || {};
    }
    getFrameworkStylesheets(load = this.loadExternalAssets) {
        return (load && this.activeFramework.stylesheets) || [];
    }
    getFrameworkScripts(load = this.loadExternalAssets) {
        return (load && this.activeFramework.scripts) || [];
    }
}
FrameworkLibraryService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: FrameworkLibraryService, deps: [{ token: Framework }, { token: WidgetLibraryService }], target: i0.ɵɵFactoryTarget.Injectable });
FrameworkLibraryService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: FrameworkLibraryService, providedIn: 'root' });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.9", ngImport: i0, type: FrameworkLibraryService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root',
                }]
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [Framework]
                }] }, { type: i1.WidgetLibraryService, decorators: [{
                    type: Inject,
                    args: [WidgetLibraryService]
                }] }]; } });
//# sourceMappingURL=eventLog:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJhbWV3b3JrLWxpYnJhcnkuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2Fqc2YtY29yZS9zcmMvbGliL2ZyYW1ld29yay1saWJyYXJ5L2ZyYW1ld29yay1saWJyYXJ5LnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUN4QyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDckQsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDbkQsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sMENBQTBDLENBQUM7OztBQUVoRiw4QkFBOEI7QUFDOUIsa0JBQWtCO0FBQ2xCLHNFQUFzRTtBQUN0RSw2Q0FBNkM7QUFDN0MsaUJBQWlCO0FBQ2pCLGlEQUFpRDtBQUNqRCxpREFBaUQ7QUFLakQsTUFBTSxPQUFPLHVCQUF1QjtJQVFsQyxZQUM2QixVQUFpQixFQUNOLGFBQW1DO1FBRDlDLGVBQVUsR0FBVixVQUFVLENBQU87UUFDTixrQkFBYSxHQUFiLGFBQWEsQ0FBc0I7UUFUM0Usb0JBQWUsR0FBYyxJQUFJLENBQUM7UUFHbEMsdUJBQWtCLEdBQUcsS0FBSyxDQUFDO1FBRTNCLHFCQUFnQixHQUFrQyxFQUFFLENBQUM7UUFNbkQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FDbEMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxTQUFTLENBQ2xELENBQUM7UUFDRixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDaEQsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBRU0scUJBQXFCLENBQUMsa0JBQWtCLEdBQUcsSUFBSTtRQUNwRCxJQUFJLENBQUMsa0JBQWtCLEdBQUcsQ0FBQyxDQUFDLGtCQUFrQixDQUFDO0lBQ2pELENBQUM7SUFFTSxZQUFZLENBQ2pCLFlBQThCLElBQUksQ0FBQyxnQkFBZ0IsRUFDbkQsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLGtCQUFrQjtRQUU1QyxJQUFJLENBQUMsZUFBZTtZQUNsQixPQUFPLFNBQVMsS0FBSyxRQUFRLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUM3RCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFDcEMsT0FBTyxTQUFTLEtBQUssUUFBUSxJQUFJLE1BQU0sQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQztvQkFDL0QsU0FBUyxDQUFDLENBQUM7b0JBQ1gsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ2pELE9BQU8sSUFBSSxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUM3RCxDQUFDO0lBRUQsd0JBQXdCLENBQUMsU0FBb0I7UUFDM0MsT0FBTyxNQUFNLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDbkMsSUFBSSxDQUFDLGFBQWEsQ0FBQyx3QkFBd0IsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNoRSxJQUFJLENBQUMsYUFBYSxDQUFDLDBCQUEwQixFQUFFLENBQUM7SUFDcEQsQ0FBQztJQUVNLFlBQVksQ0FBQyxJQUFZO1FBQzlCLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBRU0sWUFBWTtRQUNqQixJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRTtZQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQUU7UUFDbEUsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQztJQUN4QyxDQUFDO0lBRU0sbUJBQW1CO1FBQ3hCLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDO0lBQzVDLENBQUM7SUFFTSx1QkFBdUIsQ0FBQyxPQUFnQixJQUFJLENBQUMsa0JBQWtCO1FBQ3BFLE9BQU8sQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDMUQsQ0FBQztJQUVNLG1CQUFtQixDQUFDLE9BQWdCLElBQUksQ0FBQyxrQkFBa0I7UUFDaEUsT0FBTyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUN0RCxDQUFDOztvSEE3RFUsdUJBQXVCLGtCQVN4QixTQUFTLGFBQ1Qsb0JBQW9CO3dIQVZuQix1QkFBdUIsY0FGdEIsTUFBTTsyRkFFUCx1QkFBdUI7a0JBSG5DLFVBQVU7bUJBQUM7b0JBQ1YsVUFBVSxFQUFFLE1BQU07aUJBQ25COzswQkFVSSxNQUFNOzJCQUFDLFNBQVM7OzBCQUNoQixNQUFNOzJCQUFDLG9CQUFvQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEZyYW1ld29yayB9IGZyb20gJy4vZnJhbWV3b3JrJztcbmltcG9ydCB7IGhhc093biB9IGZyb20gJy4uL3NoYXJlZC91dGlsaXR5LmZ1bmN0aW9ucyc7XG5pbXBvcnQgeyBJbmplY3QsIEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFdpZGdldExpYnJhcnlTZXJ2aWNlIH0gZnJvbSAnLi4vd2lkZ2V0LWxpYnJhcnkvd2lkZ2V0LWxpYnJhcnkuc2VydmljZSc7XG5cbi8vIFBvc3NpYmxlIGZ1dHVyZSBmcmFtZXdvcmtzOlxuLy8gLSBGb3VuZGF0aW9uIDY6XG4vLyAgIGh0dHA6Ly9qdXN0aW5kYXZpcy5jby8yMDE3LzA2LzE1L3VzaW5nLWZvdW5kYXRpb24tNi1pbi1hbmd1bGFyLTQvXG4vLyAgIGh0dHBzOi8vZ2l0aHViLmNvbS96dXJiL2ZvdW5kYXRpb24tc2l0ZXNcbi8vIC0gU2VtYW50aWMgVUk6XG4vLyAgIGh0dHBzOi8vZ2l0aHViLmNvbS9lZGNhcnJvbGwvbmcyLXNlbWFudGljLXVpXG4vLyAgIGh0dHBzOi8vZ2l0aHViLmNvbS92bGFkb3Rlc2Fub3ZpYy9uZ1NlbWFudGljXG5cbkBJbmplY3RhYmxlKHtcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnLFxufSlcbmV4cG9ydCBjbGFzcyBGcmFtZXdvcmtMaWJyYXJ5U2VydmljZSB7XG4gIGFjdGl2ZUZyYW1ld29yazogRnJhbWV3b3JrID0gbnVsbDtcbiAgc3R5bGVzaGVldHM6IChIVE1MU3R5bGVFbGVtZW50fEhUTUxMaW5rRWxlbWVudClbXTtcbiAgc2NyaXB0czogSFRNTFNjcmlwdEVsZW1lbnRbXTtcbiAgbG9hZEV4dGVybmFsQXNzZXRzID0gZmFsc2U7XG4gIGRlZmF1bHRGcmFtZXdvcms6IHN0cmluZztcbiAgZnJhbWV3b3JrTGlicmFyeTogeyBbbmFtZTogc3RyaW5nXTogRnJhbWV3b3JrIH0gPSB7fTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBASW5qZWN0KEZyYW1ld29yaykgcHJpdmF0ZSBmcmFtZXdvcmtzOiBhbnlbXSxcbiAgICBASW5qZWN0KFdpZGdldExpYnJhcnlTZXJ2aWNlKSBwcml2YXRlIHdpZGdldExpYnJhcnk6IFdpZGdldExpYnJhcnlTZXJ2aWNlXG4gICkge1xuICAgIHRoaXMuZnJhbWV3b3Jrcy5mb3JFYWNoKGZyYW1ld29yayA9PlxuICAgICAgdGhpcy5mcmFtZXdvcmtMaWJyYXJ5W2ZyYW1ld29yay5uYW1lXSA9IGZyYW1ld29ya1xuICAgICk7XG4gICAgdGhpcy5kZWZhdWx0RnJhbWV3b3JrID0gdGhpcy5mcmFtZXdvcmtzWzBdLm5hbWU7XG4gICAgdGhpcy5zZXRGcmFtZXdvcmsodGhpcy5kZWZhdWx0RnJhbWV3b3JrKTtcbiAgfVxuXG4gIHB1YmxpYyBzZXRMb2FkRXh0ZXJuYWxBc3NldHMobG9hZEV4dGVybmFsQXNzZXRzID0gdHJ1ZSk6IHZvaWQge1xuICAgIHRoaXMubG9hZEV4dGVybmFsQXNzZXRzID0gISFsb2FkRXh0ZXJuYWxBc3NldHM7XG4gIH1cblxuICBwdWJsaWMgc2V0RnJhbWV3b3JrKFxuICAgIGZyYW1ld29yazogc3RyaW5nfEZyYW1ld29yayA9IHRoaXMuZGVmYXVsdEZyYW1ld29yayxcbiAgICBsb2FkRXh0ZXJuYWxBc3NldHMgPSB0aGlzLmxvYWRFeHRlcm5hbEFzc2V0c1xuICApOiBib29sZWFuIHtcbiAgICB0aGlzLmFjdGl2ZUZyYW1ld29yayA9XG4gICAgICB0eXBlb2YgZnJhbWV3b3JrID09PSAnc3RyaW5nJyAmJiB0aGlzLmhhc0ZyYW1ld29yayhmcmFtZXdvcmspID9cbiAgICAgICAgdGhpcy5mcmFtZXdvcmtMaWJyYXJ5W2ZyYW1ld29ya10gOlxuICAgICAgdHlwZW9mIGZyYW1ld29yayA9PT0gJ29iamVjdCcgJiYgaGFzT3duKGZyYW1ld29yaywgJ2ZyYW1ld29yaycpID9cbiAgICAgICAgZnJhbWV3b3JrIDpcbiAgICAgICAgdGhpcy5mcmFtZXdvcmtMaWJyYXJ5W3RoaXMuZGVmYXVsdEZyYW1ld29ya107XG4gICAgcmV0dXJuIHRoaXMucmVnaXN0ZXJGcmFtZXdvcmtXaWRnZXRzKHRoaXMuYWN0aXZlRnJhbWV3b3JrKTtcbiAgfVxuXG4gIHJlZ2lzdGVyRnJhbWV3b3JrV2lkZ2V0cyhmcmFtZXdvcms6IEZyYW1ld29yayk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBoYXNPd24oZnJhbWV3b3JrLCAnd2lkZ2V0cycpID9cbiAgICAgIHRoaXMud2lkZ2V0TGlicmFyeS5yZWdpc3RlckZyYW1ld29ya1dpZGdldHMoZnJhbWV3b3JrLndpZGdldHMpIDpcbiAgICAgIHRoaXMud2lkZ2V0TGlicmFyeS51blJlZ2lzdGVyRnJhbWV3b3JrV2lkZ2V0cygpO1xuICB9XG5cbiAgcHVibGljIGhhc0ZyYW1ld29yayh0eXBlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gaGFzT3duKHRoaXMuZnJhbWV3b3JrTGlicmFyeSwgdHlwZSk7XG4gIH1cblxuICBwdWJsaWMgZ2V0RnJhbWV3b3JrKCk6IGFueSB7XG4gICAgaWYgKCF0aGlzLmFjdGl2ZUZyYW1ld29yaykgeyB0aGlzLnNldEZyYW1ld29yaygnZGVmYXVsdCcsIHRydWUpOyB9XG4gICAgcmV0dXJuIHRoaXMuYWN0aXZlRnJhbWV3b3JrLmZyYW1ld29yaztcbiAgfVxuXG4gIHB1YmxpYyBnZXRGcmFtZXdvcmtXaWRnZXRzKCk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuYWN0aXZlRnJhbWV3b3JrLndpZGdldHMgfHwge307XG4gIH1cblxuICBwdWJsaWMgZ2V0RnJhbWV3b3JrU3R5bGVzaGVldHMobG9hZDogYm9vbGVhbiA9IHRoaXMubG9hZEV4dGVybmFsQXNzZXRzKTogc3RyaW5nW10ge1xuICAgIHJldHVybiAobG9hZCAmJiB0aGlzLmFjdGl2ZUZyYW1ld29yay5zdHlsZXNoZWV0cykgfHwgW107XG4gIH1cblxuICBwdWJsaWMgZ2V0RnJhbWV3b3JrU2NyaXB0cyhsb2FkOiBib29sZWFuID0gdGhpcy5sb2FkRXh0ZXJuYWxBc3NldHMpOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIChsb2FkICYmIHRoaXMuYWN0aXZlRnJhbWV3b3JrLnNjcmlwdHMpIHx8IFtdO1xuICB9XG59XG4iXX0=
