import {Injectable} from '@nestjs/common';
import {Content, StyleDictionary, TableLayout} from 'pdfmake/interfaces';

@Injectable()
export class SecurityAuditReportPdfHelpersService {

  /** Large header. BY DEfault added to the Table Of Contents */
  buildHeader(title: string, options?: { skipToc?: boolean, pageBreak?: 'before' | 'after' }): Content {
    return {
      text: title,
      style: 'h1',
      tocItem: !options?.skipToc,
      tocStyle: 'tocMain',
      pageBreak: options?.pageBreak
    };
  }

  buildSubHeader(title: string, options?: { skipToc?: boolean, level?: number }): Content {
      return {
        text: title,
        style: 'h2',
        tocItem: !options?.skipToc,
        tocMargin: [options?.level ? options.level * 16 : 16, 0, 0, 0],
        tocStyle: 'tocSub',
        tocNumberStyle: 'tocSub'
      }
  }

  coloredTableHeaderLayout(color = '#d9d9d9'): TableLayout {
    return {
      // Makes header row have gray background
      fillColor: (rowIndex: number) => rowIndex === 0 ? color : null
    }
  }

  buildStyles(): StyleDictionary {
    const m9sweeperBlue = '#1155cc';
    return {
      title: {
        fontSize: 26,
        color: m9sweeperBlue,
        marginBottom: 26
      },
      h1: {
        fontSize: 20,
        color: m9sweeperBlue,
        marginBottom: 10
      },
      h2: {
        fontSize: 16,
        marginBottom: 10
      },
      tableLabel: {
        fontSize: 12,
        marginBottom: 4
      },
      body: {
        fontSize: 11,
        marginBottom: 10
      },
      tocMain: {
        fontSize: 16,
        marginBottom: 8
      },
      alert: {
        fontSize: 12,
        color: 'red',
        marginBottom: 10
      },
      tocSub: {
        fontSize: 11,
        marginBottom: 5
      },
      italics: {
        italics: true
      }
    };
  }

}