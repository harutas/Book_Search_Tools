import "../style.css";

type ResponseType = {
  start: number;
  num_found: number;
  docs: DocType[];
};

type DocType = {
  cover_i: number;
  has_fulltext: boolean;
  edition_count: number;
  title: string;
  author_name: string[];
  first_publish_year: number;
  key: string;
  ia: string[];
  author_key: string[];
  public_scan_b: boolean;
  isbn: string[];
};

const config = {
  url: "https://openlibrary.org/search.json?",
  CLITextInputId: "command-input",
  CLIOutputId: "tarminal",
};

const CLITextInput = document.getElementById(config.CLITextInputId) as HTMLInputElement;
const CLIOutPutDiv = document.getElementById(config.CLIOutputId);

// 全体の流れ:
//         (on key up)submitSearch()->
//             appendResponseParagraphsFromQueryResponseObject(CLIOutputDiv, queryResponseObject)->
//                 queryResponseObjectFromQueryString(queryString)->
//                     queryStringFromParsedCLIArray(parsedCLIArray)->
//                         commandLineParser(CLITextInput.value)

CLITextInput?.addEventListener("keyup", (e: KeyboardEvent) => submitSearch(e));

// submitSearch
function submitSearch(e: KeyboardEvent) {
  if (e.code === "Enter") {
    const parsedArray = BTools.commandLineParser(CLITextInput.value);

    BTools.appendMirrorParagraph(CLIOutPutDiv as HTMLElement);
    CLITextInput.value = "";

    if (parsedArray.length == 0) {
      BTools.appendErrorParagraph(CLIOutPutDiv as HTMLElement);
    } else {
      const queryString = BTools.queryStringFromParsedCLIArray(parsedArray);
      const queryResponseObject = BTools.queryResponseObjectFromQueryString(queryString);
      queryResponseObject.then((queryResponseObject) => {
        BTools.appendResponseParagraphsFromQueryResponseObject(CLIOutPutDiv as HTMLElement, queryResponseObject);
      });
    }
  }
}

/*
    String inputChar : 検索対象の単一文字列
    inputString : inputCharのインスタンスのために検索される対象の文字列
    return Number : inputString内のinputCharのインスタンス数
*/
function characterInstanceCountInString(inputChar: string, inputString: string) {
  if (inputChar.length != 1 || typeof inputChar != "string" || typeof inputString != "string") return -2;
  return inputString == "" ? 0 : inputString.split(inputChar).length - 1;
}

// String inputChar : 検索対象の単一文字列
// inputString : inputCharのインスタンスのために検索される対象の文字列
// return Number : inputString内のinputCharのインスタンス数

// characterInstanceCountInString

class BTools {
  // 入力をそのまま返す
  static appendMirrorParagraph(parentDiv: HTMLElement) {
    if (parentDiv != null) {
      parentDiv.innerHTML += `
      <p class="m-0">
      <span class="text-lightgreen">user</span>
      <span class="text-magenta"> @ </span>
      <span class="text-info">recursion</span>: ${CLITextInput?.value}
      </p>
      `;
    }
    return;
  }

  // エラー結果を返す
  static appendErrorParagraph(parentDiv: HTMLElement) {
    parentDiv.innerHTML += `<p class="m-0">
              <span style='color:red'>CLIError</span>: invalid input. must take form "packageName commandName" or "packageName commandName arguments"
              where packageName is 'BTools', commandName is either 'isbn-lookup' or 'search', and there are exactly 1 or 2 whitespaces.
          </p>`;

    return;
  }

  // トークンを分ける
  static commandLineParser(CLIInputString: string): string[] {
    const parsedArray = CLIInputString.trim().split(" ");
    // 条件を満たしているか検証（不適の場合は空の配列を返す）

    // トークンは3つ
    // 1つ目のトークンは「BTools」
    // 2つ目のトークンは「search」or「isbn-lookup」
    if (
      parsedArray.length != 3 ||
      parsedArray[0] != "BTools" ||
      (parsedArray[1] != "search" && parsedArray[1] != "isbn-lookup")
    )
      return [];

    // searchコマンド
    // paramsNames author or title 1回のみ
    // argumentは,で区切られている可能性あり
    if (parsedArray[1] == "search") {
      let authorCount = 0;
      let titleCount = 0;
      const argumentArray = parsedArray[2].split(",");

      for (let i = 0; i < argumentArray.length; i++) {
        if (characterInstanceCountInString("=", argumentArray[i]) == 1) {
          if (parsedArray[i].indexOf("author")) authorCount++;
          if (parsedArray[i].indexOf("title")) titleCount++;
        }
      }

      if (authorCount > 1 || titleCount > 1) return [];
    }

    return parsedArray;
  }

  // クエリを作成するためのAPIエンドポイントURLに付加される文字列。通常は、'<parameterName>=<parameterValue>&<parameterName>=<parameterValue>'の形式。
  static queryStringFromParsedCLIArray(parsedCLIArray: string[]): string {
    // search
    if (parsedCLIArray[1] === "search") {
      return parsedCLIArray[2].replace(",", "&");
    }
    // isbn-lookup
    else if (parsedCLIArray[1] === "isbn-lookup") {
      return `isbn=${parsedCLIArray[2]}`;
    }
    // 不適な引数の場合何も返さない
    else {
      console.log("BTools.queryStringFromParsedCLIObject():: invalid command type");
      return "";
    }
  }

  // 非同期で本の情報をfetching
  static async queryResponseObjectFromQueryString(queryString: string): Promise<ResponseType | null> {
    const response = await fetch(config.url + queryString)
      .then((res: Response) => res.json().then((data) => data))
      .catch((error) => {
        console.error(error);
        return null;
      });

    if (!response) return null;

    return response;
  }

  // 取得した結果をパラグラフに追加
  static appendResponseParagraphsFromQueryResponseObject(
    parentDiv: HTMLElement,
    queryResponseObject: ResponseType | null
  ): void {
    if (queryResponseObject) {
      if (queryResponseObject.docs.length == 0) {
        parentDiv.innerHTML += `<p class="m-0"><span style='color:turquoise'>openLibrary</span>: 0 matches.</p>`;
      } else {
        parentDiv.innerHTML += `<p class="m-0"><span style='color:turquoise'>openLibrary</span>: at least ${queryResponseObject.docs.length}.</p>`;

        for (let i = 0; i < queryResponseObject.docs.length; i++) {
          const book = queryResponseObject.docs[i];

          let matchParagraphString = `<p class="m-0"><span style='color:turquoise'>openLibrary</span>: [${
            i + 1
          }] author: ${book.author_name}, title: ${book.title}, first published: ${book.first_publish_year}, key: ${
            book.key
          },`;

          if (book.isbn) matchParagraphString += ` ISBN: ${book.isbn[0]}`;

          matchParagraphString += `</p>`;

          parentDiv.innerHTML += matchParagraphString;
        }
      }
    }
    return;
  }
}
