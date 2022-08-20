---
layout: post
title: "Digdagの機能紹介"
---

# {{ page.title }}
ワークフローエンジンの機能は色々あるので網羅的にまとめたいと常々思っていた。Digdag vs Airflowなどの比較記事はあるが機能ベースで紹介されることは少ないというのがモチベーション。
[実践的データ基盤への処方箋](https://gihyo.jp/book/2021/978-4-297-12445-8)を読んだところ非常に良い表があったのでそれをベースに書いていく。

> ![ワークフローエンジンが一般的に用意している機能一覧](/assets/data-syohousen-workflow.jpg)  
> 実践的データ基盤への処方箋 第2章 16節より

注意点として筆者はDigdagを構築・運用した経験しかなく、Digdagの内部にすごく詳しいコントリビューターなどではないため間違いがある可能性は大いにある。(特にできないと書いているが実際はできるなど)

## Digdag用語
この記事内で用いるDigdagの用語を解説しておく。(実質http://docs.digdag.io/concepts.html の翻訳)  
Digdagの概要は[いろんな良い記事](https://qiita.com/hiroysato/items/d0fe5e2d88c267413a82)があるのでそこを参照していただきたい。

- task
  - Digdagにおけるジョブの最小単位
  - ファイルをダウンロードするとかSQLを実行するとか一つの処理だが、冪等性が期待される
- workflow
  - 1つ1つのtaskを意味のある単位にまとめたもの
      - ファイルをS3からダウンロードし、整形し、DBにインポートするといった一連のフロー
  - Digdagにおいては1ファイル1ワークフロー
      - `.dig`ファイルで記述される
- project
   - 複数のworkflowをまとめたもの
   - 例えばプロダクトや部署単位でprojectをわけたりするイメージ
- session
   - workflowを実行するための計画
   - session_timeという「workflowが実行される時間」が実質的なIDになる
      - ここでの「workflowが実行される時間」とは実際に実行される時間とは異なるということが、ややこしいポイントでありつつもDigdagにおける最も重要な概念になっている
   - 例えば8時台のログを集計するようなworkflowを考えたとき、cronを使って実現するなら9時に実行を開始し、スクリプトの中で「現在時刻-1時間して更にhourly単位で時刻を丸める」みたいなことがあるあるだと思われる
      - ただし再実行が面倒な上に何かしらの原因で実行が10時になってしまったら8時台のログは集計されない
   - Digdagであればsession_timeを9:00で与えることでそのsession_timeをtask中で使えるので、実際に実行される時刻を気にすることなくworkflowを構成することができる
      - つまり「workflowが実行される(のを期待された)時刻」に依存する処理をなんと実際に実行される時間を気にせずにかけるのである！Digdag凄い
      - 指定の仕方は例えば`hourly>: 10:00`みたいに書くと9:10にsession_timeが9:00のsessionが実行される
      - この9:00のsessionを再実行する際も、session_timeは9:00のままなのでいつでも8時台のログを再集計できる
- attempt
   - sessionの実際の実行を表す
   - 特に何もしなかったら1sessionにつき1attempt
   - sessionを再実行したりすると増えていく
      - sessionのステータス==最新のattemptのステータスと考えて良さそう
- operator
   - taskの実行内容を規定するもので、task定義にはoperatorが必要
   - `sh>`のように書かれるもので、これはシェルスクリプトを実行するoperatorを意味している
      - 例えば`sh> echo hoge`のように書くことで`echo shell`というシェルを実行できる

## 機能
以下の機能を実現するためにDigdagコマンドもしくはWebUIを利用する場合がある。基本的にWebUIの機能は必要最低限であり、コマンドからしかできないことも多い。
ただし以下で紹介されるような基本的なコマンドは、たとえコマンドが無くても[REST API](https://docs.digdag.io/api/)を使うことで代替できる。

### 起動時刻制御
> 時刻を指定して起動できる

[今すぐあるsession_timeで実行する](http://docs.digdag.io/command_reference.html#start)ということはコマンドからできる。WebUIからは現時点ではできない。
またある時刻にあるsession_timeで実行するということはできないはず。

> 柔軟な指定ができる

毎分、毎時、毎日、毎週、毎月という単位だったりcronの記法で[スケジュールを指定できる](http://docs.digdag.io/scheduling_workflow.html#setting-up-a-schedule)。

### 起動順序制御
taskの起動順序はworkflowで書いた通りに上から実行される。  
またworkflow間でも[依存関係を定義できる](http://docs.digdag.io/operators/require.html)。デフォルトの挙動は以下だが、オプションで変えられる。
|  依存先の状態  |  挙動  |
| ---- | ---- |
|  成功  |  そのまま続きのtaskを実行  |
|  実行中  |  終了するまで待機  |
|  実行されていない  |  依存先のworkflowを実行し、終了するまで待機  |
|  失敗  |  自身も失敗  |

### 再実行・スキップ
再実行は[コマンド](http://docs.digdag.io/command_reference.html#retry)とWebUIからできる。スキップは[コマンド](http://docs.digdag.io/command_reference.html#reschedule)からのみ。

### アラート
[異常終了をキャッチしてなにかしたり](http://docs.digdag.io/workflow_definition.html#sending-error-notification)、[長時間が発生したらなにかしたり](http://docs.digdag.io/scheduling_workflow.html#setting-an-alert-if-a-workflow-doesn-t-finish-within-expected-time)できる。[メールを飛ばす](http://docs.digdag.io/operators/mail.html)機能自体は標準であるが、その他チャットツールなどに飛ばしたい場合はプラグインを探したり自作する。

### 状態管理
sessionのステータスに関してこちらから見えるのは実行中、正常終了、異常終了、キャンセルぐらい。個々のtaskは[様々な状態](https://github.com/treasure-data/digdag/blob/453a36a1937848d1856fafce5766893abd5ddb45/digdag-core/src/main/java/io/digdag/core/session/TaskStateCode.java#L10-L19)をとる

### タイムアウト制御
機能としてはない。一応sla operatorを用いることで無理やり強制終了させることはできる。

### 同時実行制御
[同時に複数のtaskを実行](http://docs.digdag.io/workflow_definition.html#parallel-execution)できたり、同時実行数を設定できる。

### リモート実行
機能としてはない。原理的にはsshして何かを実行するみたいなシェルをtaskとして書くことはできる。特に何も設定しないと実際の処理はagentが起動しているサーバーのローカルで実行される。  
次のトピックであるコンテナ実行をサポートしていたり、[Digdag自体を多数並べてHA構成をとる](https://techblog.zozo.com/entry/digdag_ha)ことでリモート実行したいユースケースをカバーしているように思える。

### コンテナ実行
実際の処理を[DockerやECSで実行する](http://docs.digdag.io/command_executor.html)ことができる。そもそもDigdag自体をコンテナ上で動かすというプラクティスもいくつかある。

### 処理のグループ化
処理＝taskとすればworkflowが処理のグループ化に相当する。workflow単位で実行、再実行、スキップできる。  
workflowのうちある特定のtaskだけ実行するなどはできないが、再実行時に失敗したtaskのみ再実行といったことはできる。

### 処理への引数指定
taskには引数を渡すことができる。session_timeなど[Digdagが用意している変数](https://docs.digdag.io/workflow_definition.html#using-variables)があったり、[_export](https://docs.digdag.io/workflow_definition.html#using-export-parameter)などによって自分で定義した環境変数のようなものを渡せる。

### バックフィル
コマンドから[バックフィルできる](http://docs.digdag.io/command_reference.html#backfill)。

### 条件分岐
_checkや_errorといった予約語をworkflow定義に用いることで、[終了状態に応じた条件分岐ができる](https://docs.digdag.io/concepts.html#dynamic-task-generation-and-check-error-tasks)。  
他にも[if operator](https://docs.digdag.io/operators/if.html)を用いることでも条件分岐でき、[Javascriptを使って簡単な式を条件に書く](https://docs.digdag.io/workflow_definition.html#calculating-variables)ことができる。

### ログ保持
[サーバーを起動するときにオプションを設定する](https://docs.digdag.io/command_reference.html#server)ことで、ログをローカルやS3やGCSに保存できる。

### 稼働情報保持
WebUIから1つ1つのsessionがどれくらい時間がかかったかはわかるが、実行時間の変化や正常終了の数といった統計情報は見ることができない。[メトリクスを取得する](https://docs.digdag.io/metrics.html)ことはできるので、そこから自前で加工すればある程度は統計情報を得ることができる。

### API
Language APIと呼ばれている[Python API](https://docs.digdag.io/python_api.html#)と[Ruby API](https://docs.digdag.io/ruby_api.html)がある。これらはtask内でのみ利用することができ、環境変数を書き換えたり、子タスクを動的に生成したりすることができる。  
[REST API](https://docs.digdag.io/rest_api.html)もあり、これはworkflow自体を実行したり、sessionの情報を取得したり、workflowの設定自体を上書きしたりすることができる。


### ビューワー
WebUIがあり、処理の状態、実行順序、実行結果などを確認できる。再実行やworkflowの編集・削除といったwrite操作も行うことができる。

### ユーザー管理
機能としてはないので、自前でなにかしら用意する必要がある。

### プラグイン
プラグインによって、[自由にoperatorをつくる](http://docs.digdag.io/concepts.html#operators-and-plugins
)ことができる。例えば[slack plugin](https://github.com/szyn/digdag-slack)を入れることで、`slack>`というoperatorが使えるようになる。

## まとめ
改めてまとめるとDigdagはちょうどよい機能がまとまっていることがわかった。おそらく要件的な課題として考えられるのは、WebUIの機能不足(特にユーザー管理)やタイムアウト制御といった部分になると思われるが、逆にその辺りが許容できれば良い選択になると思っている。  
他のワークフローエンジンでも上記のようなトピックごとのまとめがあれば、すごく参考になると思うので誰か書いてほしい。  
また改めてにはなるが、間違いがあれば是非指摘していただきたい。
