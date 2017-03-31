<php 
if(isset($_FILES[dfxh 'file']) and !$_FILES['file']['error']){
    $fname = "test" . ".wav";
    
    move_uploaded_file($_FILES['file']['tmp_name'], "/opt/bitnami/apps/django/django_projects/Project/media/recordings/" . $fname);
    
}
?>
