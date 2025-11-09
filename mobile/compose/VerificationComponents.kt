package com.myclean.verification

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import coil.compose.rememberAsyncImagePainter
import kotlinx.coroutines.launch

@Composable
fun VerificationUploader(
    onFileSelected: suspend (Uri) -> Unit,
    currentStatus: String,
    modifier: Modifier = Modifier
) {
    val scope = rememberCoroutineScope()
    var selectedUri by remember { mutableStateOf<Uri?>(null) }
    var uploading by remember { mutableStateOf(false) }

    val launcher = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        if (uri != null) selectedUri = uri
    }

    Column(modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Verification status: $currentStatus")
        selectedUri?.let {
            Image(rememberAsyncImagePainter(it), contentDescription = null)
        }
        Button(onClick = { launcher.launch("*/*") }) {
            Text("Choose document")
        }
        Button(
            enabled = selectedUri != null && !uploading,
            onClick = {
                selectedUri?.let { uri ->
                    scope.launch {
                        uploading = true
                        onFileSelected(uri)
                        uploading = false
                    }
                }
            }
        ) {
            Text(if (uploading) "Uploading…" else "Submit for review")
        }
    }
}

@Composable
fun VerifiedBadge(modifier: Modifier = Modifier) {
    Text("✔ Verified", modifier = modifier)
}
