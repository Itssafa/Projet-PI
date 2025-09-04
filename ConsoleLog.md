polyfills.js:6155 [webpack-dev-server] Server started: Hot Module Replacement disabled, Live Reloading enabled, Progress disabled, Overlay enabled.
index.js:489  [webpack-dev-server] Warnings while compiling.
logger @ index.js:489
(anonymous) @ index.js:634
warn @ index.js:164
warnings @ index.js:249
(anonymous) @ socket.js:62
client.onmessage @ WebSocketClient.js:45
index.js:489  [webpack-dev-server] WARNING
src/app/components/dashboard/dashboard.component.html:363:61 - warning NG8107: The left side of this optional chain operation does not include 'null' or 'undefined' in its type, therefore the '?.' operator can be replaced with the '.' operator.

363                       <span>{{ annonceComments[annonce.id]?.length || 0 }}</span>
                                                                ~~~~~~

  src/app/components/dashboard/dashboard.component.ts:29:16
    29   templateUrl: './dashboard.component.html',
                      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Error occurs in the template of component DashboardComponent.

logger @ index.js:489
(anonymous) @ index.js:634
warn @ index.js:164
warnings @ index.js:258
(anonymous) @ socket.js:62
client.onmessage @ WebSocketClient.js:45
index.js:489  [webpack-dev-server] WARNING
src/app/components/dashboard/dashboard.component.html:743:61 - warning NG8107: The left side of this optional chain operation does not include 'null' or 'undefined' in its type, therefore the '?.' operator can be replaced with the '.' operator.

743                       <span>{{ annonceComments[annonce.id]?.length || 0 }}</span>
                                                                ~~~~~~

  src/app/components/dashboard/dashboard.component.ts:29:16
    29   templateUrl: './dashboard.component.html',
                      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Error occurs in the template of component DashboardComponent.

logger @ index.js:489
(anonymous) @ index.js:634
warn @ index.js:164
warnings @ index.js:258
(anonymous) @ socket.js:62
client.onmessage @ WebSocketClient.js:45
index.js:489  [webpack-dev-server] WARNING
src/app/components/dashboard/dashboard.component.html:3026:73 - warning NG8107: The left side of this optional chain operation does not include 'null' or 'undefined' in its type, therefore the '?.' operator can be replaced with the '.' operator.

3026               <h4>Commentaires ({{ annonceComments[selectedAnnonce.id]?.length || 0 }})</h4>
                                                                             ~~~~~~

  src/app/components/dashboard/dashboard.component.ts:29:16
    29   templateUrl: './dashboard.component.html',
                      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Error occurs in the template of component DashboardComponent.

logger @ index.js:489
(anonymous) @ index.js:634
warn @ index.js:164
warnings @ index.js:258
(anonymous) @ socket.js:62
client.onmessage @ WebSocketClient.js:45
index.js:489  [webpack-dev-server] WARNING
src/app/components/dashboard/dashboard.component.html:3035:50 - warning NG8107: The left side of this optional chain operation does not include 'null' or 'undefined' in its type, therefore the '?.' operator can be replaced with the '.' operator.

3035                         [disabled]="!newComment?.trim()"
                                                      ~~~~

  src/app/components/dashboard/dashboard.component.ts:29:16
    29   templateUrl: './dashboard.component.html',
                      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Error occurs in the template of component DashboardComponent.

logger @ index.js:489
(anonymous) @ index.js:634
warn @ index.js:164
warnings @ index.js:258
(anonymous) @ socket.js:62
client.onmessage @ WebSocketClient.js:45
index.js:493  [webpack-dev-server] Errors while compiling. Reload prevented.
logger @ index.js:493
(anonymous) @ index.js:634
error @ index.js:156
errors @ index.js:280
(anonymous) @ socket.js:62
client.onmessage @ WebSocketClient.js:45
index.js:493  [webpack-dev-server] ERROR
src/app/components/dashboard/dashboard.component.html:339:38 - error TS2339: Property 'openCommentModal' does not exist on type 'DashboardComponent'.

339                             (click)="openCommentModal(annonce)">
                                         ~~~~~~~~~~~~~~~~

  src/app/components/dashboard/dashboard.component.ts:29:16
    29   templateUrl: './dashboard.component.html',
                      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Error occurs in the template of component DashboardComponent.

logger @ index.js:493
(anonymous) @ index.js:634
error @ index.js:156
errors @ index.js:289
(anonymous) @ socket.js:62
client.onmessage @ WebSocketClient.js:45
index.js:493  [webpack-dev-server] ERROR
src/app/components/dashboard/dashboard.component.html:372:44 - error TS2339: Property 'formatDate' does not exist on type 'DashboardComponent'.

372                     <span class="value">{{ formatDate(annonce.dateCreation) }}</span>
                                               ~~~~~~~~~~

  src/app/components/dashboard/dashboard.component.ts:29:16
    29   templateUrl: './dashboard.component.html',
                      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Error occurs in the template of component DashboardComponent.

logger @ index.js:493
(anonymous) @ index.js:634
error @ index.js:156
errors @ index.js:289
(anonymous) @ socket.js:62
client.onmessage @ WebSocketClient.js:45
index.js:493  [webpack-dev-server] ERROR
src/app/components/dashboard/dashboard.component.html:620:61 - error TS2339: Property 'toggleFavorite' does not exist on type 'DashboardComponent'.

620                       <button class="btn-favorite" (click)="toggleFavorite(annonce); $event.stopPropagation()">
                                                                ~~~~~~~~~~~~~~

  src/app/components/dashboard/dashboard.component.ts:29:16
    29   templateUrl: './dashboard.component.html',
                      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Error occurs in the template of component DashboardComponent.

logger @ index.js:493
(anonymous) @ index.js:634
error @ index.js:156
errors @ index.js:289
(anonymous) @ socket.js:62
client.onmessage @ WebSocketClient.js:45
index.js:493  [webpack-dev-server] ERROR
src/app/components/dashboard/dashboard.component.html:720:62 - error TS2339: Property 'openCommentModal' does not exist on type 'DashboardComponent'.

720                     <button class="btn btn-primary" (click)="openCommentModal(annonce)">
                                                                 ~~~~~~~~~~~~~~~~

  src/app/components/dashboard/dashboard.component.ts:29:16
    29   templateUrl: './dashboard.component.html',
                      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Error occurs in the template of component DashboardComponent.

logger @ index.js:493
(anonymous) @ index.js:634
error @ index.js:156
errors @ index.js:289
(anonymous) @ socket.js:62
client.onmessage @ WebSocketClient.js:45
index.js:493  [webpack-dev-server] ERROR
src/app/components/dashboard/dashboard.component.html:725:76 - error TS2345: Argument of type 'AnnonceSummary' is not assignable to parameter of type 'number'.

725                     <button class="btn btn-secondary" (click)="editAnnonce(annonce)">
                                                                               ~~~~~~~

  src/app/components/dashboard/dashboard.component.ts:29:16
    29   templateUrl: './dashboard.component.html',
                      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Error occurs in the template of component DashboardComponent.

logger @ index.js:493
(anonymous) @ index.js:634
error @ index.js:156
errors @ index.js:289
(anonymous) @ socket.js:62
client.onmessage @ WebSocketClient.js:45
index.js:493  [webpack-dev-server] ERROR
src/app/components/dashboard/dashboard.component.html:752:44 - error TS2339: Property 'formatDate' does not exist on type 'DashboardComponent'.

752                     <span class="value">{{ formatDate(annonce.dateCreation) }}</span>
                                               ~~~~~~~~~~

  src/app/components/dashboard/dashboard.component.ts:29:16
    29   templateUrl: './dashboard.component.html',
                      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Error occurs in the template of component DashboardComponent.

logger @ index.js:493
(anonymous) @ index.js:634
error @ index.js:156
errors @ index.js:289
(anonymous) @ socket.js:62
client.onmessage @ WebSocketClient.js:45
index.js:493  [webpack-dev-server] ERROR
src/app/components/dashboard/dashboard.component.html:756:44 - error TS2339: Property 'formatDate' does not exist on type 'DashboardComponent'.

756                     <span class="value">{{ formatDate(annonce.dateMiseAJour) }}</span>
                                               ~~~~~~~~~~

  src/app/components/dashboard/dashboard.component.ts:29:16
    29   templateUrl: './dashboard.component.html',
                      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Error occurs in the template of component DashboardComponent.

logger @ index.js:493
(anonymous) @ index.js:634
error @ index.js:156
errors @ index.js:289
(anonymous) @ socket.js:62
client.onmessage @ WebSocketClient.js:45
auth.service.ts:80 Token validation: {tokenExists: true, expiresAt: Thu Sep 04 2025 18:12:02 GMT+0100 (heure normale d’Afrique de l’Ouest), currentTime: Wed Sep 03 2025 18:22:33 GMT+0100 (heure normale d’Afrique de l’Ouest), isValid: true, timeUntilExpiry: 85769}
core.mjs:26656 Angular is running in development mode.
auth.service.ts:80 Token validation: {tokenExists: true, expiresAt: Thu Sep 04 2025 18:12:02 GMT+0100 (heure normale d’Afrique de l’Ouest), currentTime: Wed Sep 03 2025 18:22:33 GMT+0100 (heure normale d’Afrique de l’Ouest), isValid: true, timeUntilExpiry: 85769}
auth.service.ts:80 Token validation: {tokenExists: true, expiresAt: Thu Sep 04 2025 18:12:02 GMT+0100 (heure normale d’Afrique de l’Ouest), currentTime: Wed Sep 03 2025 18:22:33 GMT+0100 (heure normale d’Afrique de l’Ouest), isValid: true, timeUntilExpiry: 85769}
dashboard.component.ts:334 Loading client-specific data...
auth.service.ts:80 Token validation: {tokenExists: true, expiresAt: Thu Sep 04 2025 18:12:02 GMT+0100 (heure normale d’Afrique de l’Ouest), currentTime: Wed Sep 03 2025 18:22:34 GMT+0100 (heure normale d’Afrique de l’Ouest), isValid: true, timeUntilExpiry: 85768}
dashboard.component.ts:152 🎯 [DEBUG] MyAnnonces data: null
dashboard.component.ts:153 🎯 [DEBUG] MyAnnonces content length: undefined
dashboard.component.ts:154 🎯 [DEBUG] Active section: overview
dashboard.component.ts:155 🎯 [DEBUG] User type: CLIENT_ABONNE
dashboard.component.ts:156 🎯 [DEBUG] Is agency: false
dashboard.component.ts:157 🎯 [DEBUG] Is loading annonces: false
